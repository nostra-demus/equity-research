# Valuation Data Triage — INDIAMART

## 1. File Inventory

Note on dates: every file in `data/INDIAMART/` shares the same filesystem last-modified date (2026-08-13), which is the Drive-sync date for this pool, not the document's real vintage (CLAUDE.md §27 fix F23). "Period Covered" below is read from inside each document (filing subject line, fiscal-period header, or CIQ export header), not the file timestamp. `_pool_extracts/manifest.json` reports **0 extraction failures** across 38 workbooks (81 tabs) + 47 non-workbook files (128 extract files total) — no source is downgraded to "missing" for extraction failure (fix F03). No `ciq_facts.json` sidecar exists for this run, so headline figures below are this agent's own sourced reads of the CIQ workbooks, cited per §5.

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | Annual filing — full Integrated Annual Report + AGM Notice | FY ended Mar 31, 2026 (27th AGM notice Jun 29, 2026) | 2026-08-13 (sync) | High |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf | Annual filing (results-announcement version) | FY ended Mar 31, 2026 | 2026-08-13 (sync) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Annual_Report(Apr-30-2026).pdf | Annual filing (preliminary) | FY ended Mar 31, 2026 | 2026-08-13 (sync) | Medium (superseded by final) |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-29-2025).pdf | Annual filing | FY ended Mar 31, 2025 | 2026-08-13 (sync) | High (prior-year comparable) |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | Quarterly filing | Q1 FY27 (qtr ended Jun 30, 2026) — most recent quarterly filing | 2026-08-13 (sync) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-21-2026).pdf | Quarterly filing (exchange intimation, preliminary) | Q1 FY27 (qtr ended Jun 30, 2026) | 2026-08-13 (sync) | Medium (superseded by final) |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jan-20-2026).pdf | Quarterly filing | Q3 FY26 (qtr ended Dec 31, 2025) | 2026-08-13 (sync) | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-20-2026).pdf | Quarterly filing (preliminary) | Q3 FY26 | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Oct-17-2025).pdf | Quarterly filing | Q2 FY26 (qtr ended Sep 30, 2025) | 2026-08-13 (sync) | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Oct-17-2025).pdf | Quarterly filing (preliminary) | Q2 FY26 | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf | Quarterly filing | Q1 FY26 (qtr ended Jun 30, 2025) | 2026-08-13 (sync) | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-18-2025).pdf | Quarterly filing (preliminary) | Q1 FY26 | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-21-2025).pdf | Quarterly filing (preliminary) | Near-duplicate of Jan-22-2025 filing | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-22-2025).pdf | Quarterly filing (preliminary) | Q3 FY25 (qtr ended Dec 31, 2024) | 2026-08-13 (sync) | Low (duplicate, superseded) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Apr-29-2025).pdf | Quarterly filing (preliminary) | Q4/FY25 (year ended Mar 31, 2025) | 2026-08-13 (sync) | Low (superseded by final Annual Report FY25) |
| 22 Earnings Call transcripts (Q3 FY21 → Q1 FY27, Jan-2021 to Jul-2026) | Transcripts | Quarterly, unbroken ~5.5-year series | 2026-08-13 (sync) | Medium (management tone / guidance color for DCF assumptions) |
| IndiaMART InterMESH Limited - ShareholderAnalyst Call.pdf | Transcript (AGM shareholder/analyst call) | Jun 20, 2024 | 2026-08-13 (sync) | Low |
| **Company Comparable Analysis IndiaMART InterMESH Limited.xls** | Multi-tab workbook — see rows below | As-of 2026-08-13 | 2026-08-13 (sync) | High |
| — tab: Financial Data | Peer financial data export | Current + historical | 2026-08-13 (sync) | High |
| — tab: Trading Multiples | **Peer/comps multiples export** | As-of 2026-08-13 | 2026-08-13 (sync) | High |
| — tab: Operating Statistics | Peer operating stats | As-of 2026-08-13 | 2026-08-13 (sync) | Medium |
| — tab: Business Description | Business description | — | 2026-08-13 (sync) | Low |
| — tab: Implied Valuation | **Peer-multiple implied valuation bridge** | As-of 2026-08-13 | 2026-08-13 (sync) | High |
| — tab: Valuation Chart | Historical valuation chart data | — | 2026-08-13 (sync) | Medium |
| — tab: Credit Health Panel | Peer credit summary | — | 2026-08-13 (sync) | Low |
| — tab: Disclaimer | Boilerplate | — | 2026-08-13 (sync) | None |
| **IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls** | Multi-tab workbook — see rows below | — | 2026-08-13 (sync) | High |
| — tab: Consensus | **Consensus/estimate export** (523×32) | Current, FY27E–FY30E + CY | 2026-08-13 (sync) | High |
| — tab: Recent Changes | Estimate revision history | Trailing periods | 2026-08-13 (sync) | Medium |
| — tab: Multiples | **Forward multiples export (NTM, FY27–FY30E, CY26–CY29E)** | Current fiscal year end Mar-31-2027 | 2026-08-13 (sync) | High |
| — tab: Surprise | Historical beat/miss data | Multi-quarter | 2026-08-13 (sync) | Medium |
| — tab: Trends | Estimate trend history | Multi-quarter | 2026-08-13 (sync) | Medium |
| — tab: Revisions | Analyst-level revision log | Multi-quarter | 2026-08-13 (sync) | Medium |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport (1).xls | Duplicate workbook — tab: Consensus only | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| **IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls** | Multi-tab workbook (13 tabs) — see rows below | — | 2026-08-13 (sync) | High |
| — tab: Key Stats | **Current capitalization, share price, EV bridge, valuation multiples** | Price as of latest close; FY ends Mar-31-2023A→2029E | 2026-08-13 (sync) | High |
| — tab: Income Statement | **Income statement, incl. diluted EPS & diluted share count** | FY2021A–FY2026A + LTM Jun-2026 | 2026-08-13 (sync) | High |
| — tab: Balance Sheet | **Balance sheet** | FY2021A–FY2026A + LTM Jun-2026 | 2026-08-13 (sync) | High |
| — tab: Cash Flow | **Cash flow statement** | FY2022A–FY2026A + LTM Jun-2026 | 2026-08-13 (sync) | High |
| — tab: Multiples | Own-history multiples (trailing) | Multi-year | 2026-08-13 (sync) | High |
| — tab: Historical Capitalization | **Quarterly price/share count/EV history** (6 quarters, Mar-25→Jun-26) | Quarterly | 2026-08-13 (sync) | High |
| — tab: Capital Structure Summary | **Capital structure, net debt/net cash** | FY2025A, FY2026A, Q1 FY27 | 2026-08-13 (sync) | High |
| — tab: Capital Structure Details | Debt instrument detail (lease liabilities only) | FY2025, FY2026 | 2026-08-13 (sync) | Medium |
| — tab: Ratios | Financial ratios incl. dividend per share | Multi-year | 2026-08-13 (sync) | Medium |
| — tab: Supplemental | Supplemental financial data | Multi-year | 2026-08-13 (sync) | Low |
| — tab: Industry Specific | Industry-specific metrics | Multi-year | 2026-08-13 (sync) | Low |
| — tab: Pension OPEB | Pension/OPEB (not applicable — India) | — | 2026-08-13 (sync) | None |
| — tab: Segments | **Segment revenue & EBITDA** | FY2021A–FY2026A | 2026-08-13 (sync) | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Duplicate workbook — same 13 tabs as Financials (1).xls | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Balance Sheet.xls | Standalone duplicate — tab: Balance Sheet | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Capital Structure Details.xls | Standalone duplicate — tab: Capital Structure Details | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Capital Structure Summary.xls | Standalone duplicate — tab: Capital Structure Summary | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Cash Flow.xls | Standalone duplicate — tab: Cash Flow | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Income Statement (1).xls | Standalone duplicate — tab: Income Statement | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Income Statement.xls | Standalone duplicate — tab: Income Statement | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Key Stats.xls | Standalone duplicate — tab: Key Stats | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Pension OPEB.xls | Standalone duplicate — tab: Pension OPEB | — | 2026-08-13 (sync) | None |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Ratios.xls | Standalone duplicate — tab: Ratios | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Segments.xls | Standalone duplicate — tab: Segments | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Supplemental.xls | Standalone duplicate — tab: Supplemental | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Fixed Income Securities Summary.xls | Fixed-income securities summary | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Comparable M A Transactions.xls | M&A comps | Historical deal list | 2026-08-13 (sync) | Medium |
| Transaction Summary M A Private Placements.xls | M&A / private placement transaction log | Historical | 2026-08-13 (sync) | Low |
| Transaction Summary Public Offerings.xls | Public offerings log | Historical | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls | Multi-tab workbook (5 tabs: Summary, Financials, Operational/Solvency/Liquidity charts, Disclaimer) | Current | 2026-08-13 (sync) | Medium |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls | Multi-tab workbook (3 tabs) — subsidiary/investment structure | Current | 2026-08-13 (sync) | Medium (Busy Infotech / equity-method investees, informs EV bridge) |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Co Investors.xls | Co-investor list | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Direct Investments.xls | Direct investments (equity-method stakes) | Current | 2026-08-13 (sync) | Medium (EV bridge — equity-method investments) |
| IndiaMART InterMESH Limited NSEI INDIAMART Analyst Coverage.rtf | Broker coverage/rating roster | Current | 2026-08-13 (sync) | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Long Business Description.rtf | Business description | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Company Profile.rtf | Company profile | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Industry Classifications.rtf | Industry classification | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Private Ownership.rtf | Private ownership data | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Ownership Summary.rtf | Public/institutional ownership data | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Board Members.xls / Committees.xls / Compensation Summary Compensation.xls / Auditors.xls | Governance data exports | Current | 2026-08-13 (sync) | Low (governance module's remit, not valuation) |
| IndiaMART InterMESH Limited NSEI INDIAMART Competitors.xls / Products.xls / Customers.xls / Suppliers.xls / Strategic Alliances.xls / Corporate Timeline.xls / Key Developments.xls / Events Calendar.xls / Professionals.xls / Transaction Advisors.xls / Offices.rtf / Transcripts.xls (index) | Corporate reference data | Current/historical | 2026-08-13 (sync) | Low |

**Reconciliation vs manifest:** `_pool_extracts/manifest.md` lists 38 workbooks → 81 tabs; every tab above is reconciled 1:1 against that manifest. Several `.xls` files are standalone-duplicate exports of tabs already embedded in the master `Financials (1).xls` / `Financials.xls` workbooks (Balance Sheet, Cash Flow, Income Statement, Key Stats, Ratios, Segments, Supplemental, Capital Structure Summary/Details, Pension OPEB) — flagged as duplicates, not counted twice toward sufficiency. `EstimatesReport (1).xls` is a partial duplicate of `EstimatesReport.xls` (Consensus tab only; the full workbook has 6 tabs).

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | India — NSE: INDIAMART, BSE: 542726 | `FY26 Annual Report (Ind AS), Jun-02-2026`; `Financials.xls, Key Stats tab` header "NSEI:INDIAMART" |
| Filing regime | India — SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015, Reg 30/33/34 | Cross-referenced from `earnings/00_earnings-data-triage.md` §0, itself citing `Q1 FY27 Board-outcome intimation, Jul-21-2026` |
| Reporting standard | Ind AS (Indian Accounting Standards, Companies Act 2013 Sec. 133) | `FY26 Annual Report, Jun-02-2026`, Auditor's Report; CIQ `EstimatesReport.xls, Multiples tab` header states "Acctg. Standard: India GAAP" (CIQ's label for Ind AS) |
| Reporting currency (and scale) | INR; filings state ₹ crore/lakh with absolute figures; CIQ exports in ₹ millions | `Financials (1).xls, Income Statement tab` — "Currency: INR", "In Millions of the reported currency" |
| Fiscal-year end | March 31 | `FY26 Annual Report, Jun-02-2026`: "financial year ended March 31, 2026"; `Financials (1).xls, Key Stats tab`: "12 months Mar-31-2026A" |
| Document language(s) | English (all filings, transcripts, and CIQ exports in this pool are English; no non-English source documents found) | Full pool review |

No US SEC form (10-K/10-Q/8-K) is expected or present for this Indian issuer; the local equivalents (Annual Report, SEBI LODR quarterly results, Reg 30 exchange intimations) are used throughout and are NOT treated as missing data (CLAUDE.md §27). No non-English document exists in this pool, so the §27 "language is not a data gap" rule is not triggered on this run.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, vs run date 2026-08-14) |
|---|---|---|---|
| Annual filing | `IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf` | FY ended Mar 31, 2026 | ~2.4 months |
| Quarterly filing | `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf` | Q1 FY27, qtr ended Jun 30, 2026 | <1 month |
| Capital structure / balance sheet | `Financials (1).xls`, Balance Sheet + Capital Structure Summary tabs | Q1 FY27 (Jun 30, 2026) — quarterly cadence to Jun-2026 | <1 month |
| Consensus / estimate export | `IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls`, Consensus tab | Current, FY27E–FY30E; revisions current through late Jul 2026 (per earnings module cross-check) | <1 month |
| Multiples export | `IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls`, Multiples tab; `Financials (1).xls`, Key Stats/Multiples tabs | Current fiscal year end Mar-31-2027; price data as of latest close | <1 month |
| Peer / comps export | `Company Comparable Analysis IndiaMART InterMESH Limited.xls`, Trading Multiples + Implied Valuation tabs | As-of 2026-08-13 | 1 day |
| Current price (IBKR / Capital IQ) | `Financials (1).xls`, Key Stats tab — Capital IQ share price | ₹1,784.60 (latest close referenced in the Key Stats capitalization block; comps workbook As-Of Date 2026-08-13) | ~1 day |
| Cash flow statement | `Financials (1).xls`, Cash Flow tab | FY2022A–FY2026A + LTM Jun-2026 | <1 month (LTM) |
| Segment data | `Financials (1).xls`, Segments tab | FY2021A–FY2026A | ~2.4 months (latest annual segment split) |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | `Financials (1).xls, Key Stats tab` — ₹1,784.60; comps workbook As-Of Date 2026-08-13 [Capital IQ Key Stats export, data as of 2026-08-13] | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | `Financials (1).xls, Income Statement tab` — "Weighted Avg. Diluted Shares Out." 60.29m (FY26); Key Stats "Shares Out." 60.13m (latest as-reported) | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Partial — Y (diluted share count reported; no granular options/RSU strike-price schedule found in this pool) | `Financials (1).xls, Income Statement tab` (diluted vs basic EPS/shares reconciled); no treasury-stock-method detail workbook found | Needed for fully diluted per-share fair value; basic-to-diluted gap here is small (~60.13m basic vs ~60.29m diluted, <0.3%), so the limitation is minor |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | `business-model/99_business-model-synthesis.md` — "India-focused, subscription-funded B2B online marketplace"; single reportable operating segment (Web and Related Services, 92% of FY26 revenue) plus a small consolidated software subsidiary | Determines which valuation methods are valid — this is an Operating company |
| Total debt, cash, minority/preferred | Y | `Financials (1).xls, Capital Structure Summary tab` — Total Debt ₹216.28m (lease liabilities only), Cash & ST Investments ₹33,886.58m, Net Debt −₹33,670.3m (net cash), no minority interest or preferred equity disclosed | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | `Financials (1).xls, Income Statement tab` — FY2021A–FY2026A + LTM Jun-2026 | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | `Financials (1).xls, Cash Flow tab` — FY2022A–FY2026A + LTM Jun-2026 | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | `EstimatesReport.xls, Consensus + Multiples tabs` — NTM, FY2027E–FY2030E, CY2026E–CY2029E, 15–18 analysts covering per earnings-module cross-check | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | `Financials (1).xls, Multiples tab` + `Key Stats tab` — trailing TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/BV back to FY2023A | Own-history re-rating read |
| Peer / comps data | Y | `Company Comparable Analysis ....xls, Trading Multiples + Implied Valuation tabs` — 6-company comp set (Just Dial, Info Edge/Naukri, Eternal/Zomato, Zhejiang NetSun, Zarea, Yangtze River) | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y (revenue & EBITDA; no segment EBIT/EBIT-margin line separately disclosed) | `Financials (1).xls, Segments tab` — Web and Related Services + Accounting Software Services, FY2021A–FY2026A | Sum-of-the-parts (business is effectively single-segment — see §6A) |
| Dividend / buyback data | Y | `Financials (1).xls, Ratios tab` — Dividend per Share history; `Financials (1).xls, Cash Flow tab` — "Repurchase of Common Stock" ₹1,232.6m (FY24), ₹6,161.9m (FY25) | Shareholder-yield read |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y (`analyses/INDIAMART_2026-08-13/business-model/03_segment-map.md`) |
| business-model/08_competitive-map.md | Y (`analyses/INDIAMART_2026-08-13/business-model/08_competitive-map.md`) |
| business-model/07_business-quality.md | Y (`analyses/INDIAMART_2026-08-13/business-model/07_business-quality.md`) |
| business-model/09_moat.md | Y (`analyses/INDIAMART_2026-08-13/business-model/09_moat.md`) |
| business-model/10_external-dependency.md | Y (`analyses/INDIAMART_2026-08-13/business-model/10_external-dependency.md`) |
| earnings/01_historical-financials.md | Y (`analyses/INDIAMART_2026-08-13/earnings/01_historical-financials.md`) |
| earnings/04_guidance-consensus.md | Y (`analyses/INDIAMART_2026-08-13/earnings/04_guidance-consensus.md`) |
| earnings/03_margin-drivers.md | Y (`analyses/INDIAMART_2026-08-13/earnings/03_margin-drivers.md`) |
| earnings/07_earnings-sensitivity.md | Y (`analyses/INDIAMART_2026-08-13/earnings/07_earnings-sensitivity.md`) |
| earnings/06_earnings-quality.md | Y (`analyses/INDIAMART_2026-08-13/earnings/06_earnings-quality.md`) |

Both upstream modules returned a "Sufficient" data verdict with zero active partial-data caps (per their `99` syntheses), so this valuation module inherits a fully populated evidence base for warranted-multiple, cyclicality, and moat judgments. Note: the cross-module run is dated 2026-08-13, one day before this valuation run (2026-08-14); no material staleness.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — pool-verified price present (₹1,784.60, Capital IQ Key Stats, as-of consistent with the comps workbook's 2026-08-13 As-Of Date, 1 day before run date) | 01, 05, 07, 99 | Not applied |
| No consensus / forward estimates | N — full consensus and forward-multiples export present (NTM through FY2030E/CY2029E, 15–18 analysts) | 02, 03, 04, 05 | Not applied |
| No peer data | N — 6-company comp set present (Trading Multiples + Implied Valuation tabs), though 2 of 6 peers show NM/blank multiples and the set spans very different business models (see §6 caveat) | 03, 06 | Not applied |
| No segment-level data | N — segment revenue and EBITDA present FY2021A–FY2026A, though the business is effectively single-segment (92% of FY26 revenue/EBITDA from Web and Related Services) | 06 | SOTP collapses to consolidated read per Segment/SOTP Rule — not a data gap, a business-structure fact |
| No balance sheet / capital structure | N — full balance sheet + capital structure detail present at quarterly cadence through Jun-2026 | 01, 04, 06 | Not applied |
| No cash flow statement | N — full annual + LTM + quarterly cash flow statements present | 04 | Not applied |

No partial-data caps from the MODULE_RULES.md table are triggered on this run.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Trailing TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/BV available FY2023A→LTM Jun-2026 and forward FY2027E–FY2029E, from `Financials (1).xls, Key Stats/Multiples tabs` |
| Peer relative valuation | Y (with caveat) | None blocking, but comp-set quality is mixed | 6-name comp set (Just Dial, Info Edge/Naukri, Eternal/Zomato, Zhejiang NetSun, Zarea, Yangtze River) spans classifieds, hyperlocal listings, food delivery, and a name with no data (Yangtze River) — `03_relative-valuation-peers` must select/weight comparables carefully rather than using the raw mean/median, and should cross-check against `business-model/08_competitive-map.md`'s named peers |
| Intrinsic DCF (Operating FCFF) | Y | None | Full income statement + cash flow statement (CFO, capex) available FY2022A–FY2026A + LTM; `earnings/01_historical-financials.md` and `earnings/03_margin-drivers.md` supply the margin/growth base |
| Reverse DCF | Y (conditional on `04` running first) | Depends on `04`'s canonical WACC + normalized FCF base per MODULE_RULES §9 | Pool-verified current price is available, so "what's priced in" is computable once `04` runs |
| SOTP | Partial — collapses to single-segment read | Business is >85% EBIT-concentrated in one segment (Web and Related Services) | Per the Segment/SOTP Rule, `06` should state "single-segment — SOTP collapses to the consolidated read" rather than force a spurious breakup of the small loss-making Accounting Software Services subsidiary |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A pool-verified current price, full income statement and cash flow statement, complete capital-structure/net-debt data, current consensus forward estimates, and a peer comps export are all present with zero extraction failures — every input the sufficiency rule requires is available, and at least four of five valuation methods can run.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (FCFF), reverse-DCF (once `04` runs). SOTP is available only in its collapsed single-segment form per the Segment/SOTP Rule — the company is not a genuine multi-segment conglomerate (Web and Related Services is 91.96% of FY26 revenue and >100% of segment profit, per `business-model/03_segment-map.md`).
- **Active partial-data caps:** None.
- **Critical missing items:** None. Minor limitation only: no granular options/RSU treasury-stock-method schedule was found in this pool (the basic-to-diluted share gap is small, ~60.13m vs ~60.29m, so `01_price-and-capital-structure` can default to the disclosed weighted-average diluted share count per the Fully Diluted Equity Rules fallback, with the limitation labelled).
