# Earnings Data Triage — CRM

Company: Salesforce, Inc. (NYSE: CRM). Data pool: `data/CRM/`. Triage date: 2026-06-08.

All workbooks were pre-extracted with the canonical engine extractor (`.claude/tools/extract_pool.py`), which split 7 workbooks into 49 per-tab text extracts and decoded the three mislabeled documents (Capital IQ ships the 10-K as `.doc` but it is MHTML; the two transcripts ship as `.rtf` but are binary Word). Inventory below is reconciled against `analyses/CRM_2026-06-08/_pool_extracts/manifest.md` — every workbook tab is listed as its own row.

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-K cover, "SECURITIES AND EXCHANGE COMMISSION"; ticker NYSE:CRM throughout Capital IQ exports |
| Exchange | NYSE (ticker CRM) | Financials_annual, Income Statement header "Salesforce, Inc. (NYSE:CRM)" |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | `Salesforce_Inc_-_Form_10-K(Mar-02-2026).doc` (Form 10-K); `Form_DEF_14A(Apr-16-2026).doc` (US proxy) |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | EstimatesReport, Surprise tab, "Acctg. Standard: US GAAP" across all years 2004–2026 |
| Reporting currency | USD | Financials_annual, Income Statement, "Currency: USD" all columns |
| Fiscal-year end | January 31 | 10-K, "for the fiscal year ended January 31, 2026"; annual columns end Jan-31 |

This is a US filer. US forms are the correct local documents here, so no US-form-equivalence remapping is needed (CLAUDE.md §27). Downstream agents should treat the 10-K as the audited annual filing, the quarterly Capital IQ financials + transcripts as the interim record, and cite in USD with a January fiscal-year end. Salesforce is a SaaS (software-as-a-service, subscription software) business — the most decision-relevant operating KPIs (remaining performance obligation / RPO, current RPO / cRPO, attrition) live in the 10-K and the transcripts, NOT in the standardized Capital IQ financial statements.

## 1. File Inventory

Sizes and last-modified dates are from the source files in `data/CRM/`. Workbook rows show parent file + sheet + rows×cols from the manifest.

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| Salesforce_Inc_-_Form_10-K(Mar-02-2026).doc (MHTML; 3.6 MB) | Annual filing (10-K) | FY26 (ended Jan-31-2026) | 2026-05-29 | High |
| Salesforce, Inc., Q1 2027 Earnings Call, May 27, 2026.rtf (binary Word; 311 KB) | Earnings transcript | Q1 FY27 (qtr ended Apr-30-2026) | 2026-05-29 | High |
| Salesforce, Inc., Q4 2026 Earnings Call, Feb 25, 2026.rtf (binary Word; 350 KB) | Earnings transcript | Q4 FY26 (qtr ended Jan-31-2026) | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_annual.xls → Income Statement | Annual filing (data export) | FY22–FY26 + LTM Apr-30-2026 | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_annual.xls → Balance Sheet | Annual filing (data export) | FY22–FY26 + LTM Apr-30-2026 | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_annual.xls → Cash Flow | Annual filing (cash flow data) | FY22–FY26 + LTM Apr-30-2026 | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_annual.xls → Segments | Annual filing (data export) | FY21–FY26 | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_annual.xls → Key Stats | Data export | FY22–FY26 + share price | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_annual.xls → Multiples | Data export | FY22–FY26 | 2026-05-29 | Medium |
| Salesforce Inc NYSE CRM Financials_annual.xls → Ratios | Data export | FY22–FY26 (161 rows) | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_annual.xls → Supplemental | Data export | FY22–FY26 | 2026-05-29 | Medium |
| Salesforce Inc NYSE CRM Financials_annual.xls → Capital Structure Summary | Data export | FY22–FY26 | 2026-05-29 | Medium |
| Salesforce Inc NYSE CRM Financials_annual.xls → Capital Structure Details | Data export | FY22–FY26 | 2026-05-29 | Low |
| Salesforce Inc NYSE CRM Financials_annual.xls → Historical Capitalization | Data export | FY22–FY26 | 2026-05-29 | Low |
| Salesforce Inc NYSE CRM Financials_annual.xls → Industry Specific | Data export | sparse (15×6) | 2026-05-29 | Low |
| Salesforce Inc NYSE CRM Financials_annual.xls → Pension OPEB | Data export | sparse (15×6) | 2026-05-29 | Low |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Income Statement | Quarterly filing (data export) | Jul-31-2020 → Apr-30-2026 (≈24 qtrs) | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Balance Sheet | Quarterly filing (data export) | Jul-31-2020 → Apr-30-2026 | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Cash Flow | Quarterly filing (cash flow data) | Jul-31-2020 → Apr-30-2026 | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Segments | Quarterly filing (data export) | quarterly, ≈20 cols | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Key Stats | Data export | quarterly | 2026-05-29 | Medium |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Multiples | Data export | quarterly | 2026-05-29 | Medium |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Ratios | Data export | quarterly (161 rows) | 2026-05-29 | High |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Supplemental | Data export | quarterly | 2026-05-29 | Medium |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Capital Structure Summary | Data export | quarterly | 2026-05-29 | Low |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Capital Structure Details | Data export | quarterly | 2026-05-29 | Low |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Historical Capitalization | Data export | quarterly | 2026-05-29 | Low |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Industry Specific | Data export | sparse (15×6) | 2026-05-29 | Low |
| Salesforce Inc NYSE CRM Financials_quarterly.xls → Pension OPEB | Data export | sparse (15×6) | 2026-05-29 | Low |
| Salesforce,IncNYSECRMEstimatesReport.xls → Consensus | Consensus / estimate export | forward estimates (554×105) | 2026-05-29 | High |
| Salesforce,IncNYSECRMEstimatesReport.xls → Guidance | Guidance data | by period through FY27 (137×110) | 2026-05-29 | High |
| Salesforce,IncNYSECRMEstimatesReport.xls → Recent Changes | Estimate revisions | recent revisions (265×10) | 2026-05-29 | High |
| Salesforce,IncNYSECRMEstimatesReport.xls → Revisions | Estimate revisions | revision history (485×22) | 2026-05-29 | High |
| Salesforce,IncNYSECRMEstimatesReport.xls → Trends | Estimate trends | estimate trends (325×22) | 2026-05-29 | High |
| Salesforce,IncNYSECRMEstimatesReport.xls → Surprise | Beat/miss history | FY2004–FY2026 actual vs estimate | 2026-05-29 | High |
| Salesforce,IncNYSECRMEstimatesReport.xls → Multiples | Consensus multiples | small (26×7) | 2026-05-29 | Medium |
| Salesforce Inc NYSE CRM Credit Health Panel.xls → Summary | Credit / data export | recent | 2026-06-08 | Low |
| Salesforce Inc NYSE CRM Credit Health Panel.xls → Financials | Credit / data export | recent | 2026-06-08 | Low |
| Salesforce Inc NYSE CRM Credit Health Panel.xls → Operational Metrics Charts | Credit / chart export | sparse | 2026-06-08 | Low |
| Salesforce Inc NYSE CRM Credit Health Panel.xls → Solvency Metrics Charts | Credit / chart export | sparse | 2026-06-08 | Low |
| Salesforce Inc NYSE CRM Credit Health Panel.xls → Liquidity Metrics Charts | Credit / chart export | sparse | 2026-06-08 | Low |
| Salesforce Inc NYSE CRM Credit Health Panel.xls → Disclaimer | Other | n/a | 2026-06-08 | Low |
| Company Comparable Analysis Salesforce Inc .xls → Financial Data | Comps / data export | peer set | 2026-06-08 | Low |
| Company Comparable Analysis Salesforce Inc .xls → Trading Multiples | Comps / data export | peer set | 2026-06-08 | Low |
| Company Comparable Analysis Salesforce Inc .xls → Operating Statistics | Comps / data export | peer set | 2026-06-08 | Low |
| Company Comparable Analysis Salesforce Inc .xls → Business Description | Other | business overview | 2026-06-08 | Low |
| Company Comparable Analysis Salesforce Inc .xls → Implied Valuation | Valuation (out of module scope) | peer set | 2026-06-08 | Low |
| Company Comparable Analysis Salesforce Inc .xls → Valuation Chart | Valuation (out of module scope) | sparse | 2026-06-08 | Low |
| Company Comparable Analysis Salesforce Inc .xls → Credit Health Panel | Credit / data export | recent | 2026-06-08 | Low |
| Company Comparable Analysis Salesforce Inc .xls → Disclaimer | Other | n/a | 2026-06-08 | Low |
| Salesforce_Inc_-_Form_DEF_14A(Apr-16-2026).doc (MHTML; 24.5 MB) | Proxy (governance/pay) | 2026 annual meeting | 2026-06-08 | Low |
| Salesforce Inc NYSE CRM Key Developments.rtf (2.3 MB) | Other (event log) | multi-year news/events | 2026-06-08 | Low |
| Salesforce Inc NYSE CRM Public Ownership History.xls → History | Ownership export | 4,496 rows | 2026-05-29 | Low |
| Salesforce Inc NYSE CRM Public Ownership Insider Trading.xls → Insider Trading | Ownership / insider | 995 rows | 2026-05-29 | Low |

Relevance ratings reflect earnings-module use only: the proxy, comps, credit panel, ownership and insider files are listed for completeness but are primarily governance/valuation/solvency inputs for other modules. `.DS_Store` is an OS artifact, not data.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Salesforce_Inc_-_Form_10-K(Mar-02-2026).doc | FY26 (ended Jan-31-2026) | ~3 (filed Mar-02-2026) |
| Quarterly filing | Salesforce Inc NYSE CRM Financials_quarterly.xls (latest col Apr-30-2026) | Q1 FY27 (ended Apr-30-2026) | ~1 |
| Earnings transcript | Salesforce, Inc., Q1 2027 Earnings Call, May 27, 2026.rtf | Q1 FY27 | ~0.4 (May-27-2026) |
| Investor deck | None in pool | — | — |
| Consensus / estimate export | Salesforce,IncNYSECRMEstimatesReport.xls (Consensus tab) | forward, as of ~2026-05-29 | ~0.3 |
| Cash flow data | Financials_annual / Financials_quarterly (Cash Flow tabs) | through Q1 FY27 / LTM Apr-30-2026 | ~1 |
| Guidance data | Salesforce,IncNYSECRMEstimatesReport.xls (Guidance tab) | by period through FY27 + Q1 FY27 transcript | ~0.3 |

No standalone investor-presentation file is in the pool. Guidance is still well covered: the Capital IQ Guidance tab carries management's guided figures by period (current fiscal year end Jan-31-2027), and the two transcripts carry the spoken outlook. So "no investor deck" does not strip guidance.

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | Financials_annual / _quarterly, Income Statement tabs; 10-K | Needed for revenue, margin, EPS |
| Balance sheet | Y | Financials_annual / _quarterly, Balance Sheet tabs; 10-K | Needed for working capital and leverage |
| Cash flow statement | Y | Financials_annual / _quarterly, Cash Flow tabs (CFO and capex present); 10-K | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Financials_quarterly (col Apr-30-2026); Q1 FY27 transcript | Needed for trend and setup |
| Last 8 quarters | Y | Financials_quarterly Income Statement, Jul-31-2020 → Apr-30-2026 (~24 qtrs) | Needed for seasonality and inflection |
| Consensus estimates | Y | EstimatesReport, Consensus tab (554×105) | Needed for market bar |
| Estimate revisions | Y | EstimatesReport, Recent Changes + Revisions + Trends tabs | Needed for revision momentum |
| Earnings transcript | Y | Q1 FY27 (May-27-2026) and Q4 FY26 (Feb-25-2026) calls; CEO Benioff + CFO Washington present | Needed for management tone and driver detail |
| Segment P&L | Partial | Financials_*, Segments tabs report Salesforce as ONE segment ("Multiple Enterprise Cloud Computing Market"); 10-K reportable segment is single | Needed for mix shift |
| Current price | Y | Financials_annual Key Stats: Share Price 176.17, Market Cap 144,283.23 (USD m) | Needed only for master-level stock reaction context |

Note on Segment P&L: Capital IQ collapses Salesforce into a single reportable segment, consistent with the 10-K's single-segment reporting. Cloud-level revenue lines (e.g., subscription vs professional services, and cloud families) appear in the 10-K text and transcripts as revenue disaggregation, not as a segment P&L. So a true multi-segment P&L is not available; 02/03 should run consolidated with cloud-level revenue disaggregation from the 10-K, and flag the single-segment limitation. This is a disclosure characteristic of the issuer, not a missing-data gap.

SaaS KPI availability (decision-critical for this name): RPO and current RPO (cRPO) are disclosed in the 10-K (17 mentions of remaining performance obligation, 7 of current RPO) and discussed in the transcripts (cRPO referenced); customer attrition is referenced in both the 10-K and the Q1 FY27 call. These KPIs live in the filing/transcripts, NOT in the standardized Capital IQ financial tabs — downstream agents (02, 04, 05) must pull RPO/cRPO/attrition from the 10-K and transcripts directly.

## 4. Cross-Module Availability

`analyses/CRM_2026-06-08/business-model/` exists but is EMPTY — no business-model outputs are present.

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | N |
| 06_value-chain.md | N |
| 10_external-dependency.md | N |

Consequence: the earnings module proceeds independently. Agents 02 and 03 must state: "Business-model module not available — segment decomposition and external variable identification based on this module's own read." Because Capital IQ already shows a single reportable segment, the absence of `03_segment-map.md` does not change the consolidated-plus-cloud-disaggregation approach.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N | 04, 05, 99 | None — full consensus, revisions, surprise, and guidance present |
| No quarterly data | N | 01, 02, 03, 06 | None — ~24 quarters present through Q1 FY27 |
| No earnings transcript | N | 02, 03, 04 | None — two transcripts (Q1 FY27, Q4 FY26) present |
| No segment-level P&L | Y (issuer is single-segment) | 02, 03, 99 | Earnings clarity max 70 per MODULE_RULES — applies only if the synthesizer treats the single reportable segment as "no segment P&L for a multi-segment business." Salesforce reports as one segment, so 02/03 run consolidated with 10-K cloud-level revenue disaggregation and flag the limitation; the cap is noted but likely not binding because there is no hidden multi-segment mix being suppressed. Synthesizer to confirm. |
| No cash flow statement | N | 06, 99 | None — annual and quarterly cash flow with CFO and capex present (FCF computable) |
| No current price | N | 99 | None — Share Price 176.17 (USD) in Key Stats |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent audited annual filing (FY26 10-K, filed Mar-02-2026), the latest quarter (Q1 FY27, ended Apr-30-2026) via both Capital IQ quarterly financials and a same-quarter transcript, and full income statement, balance sheet, and cash flow data are all present — plus consensus, estimate revisions, surprise history, and management guidance.
- **Active partial-data caps:** None binding. (Watch item: single reportable segment — 02/03 run consolidated with 10-K cloud-level revenue disaggregation and flag the single-segment limitation; the "no segment P&L" clarity-≤70 cap is noted for the synthesizer but is not expected to bind because the issuer genuinely reports one segment rather than hiding segment mix.)
- **Critical missing items:** None. Minor gaps only: no standalone investor-presentation file (guidance is still covered by the Capital IQ Guidance tab and the transcripts); SaaS KPIs (RPO/cRPO/attrition) must be read from the 10-K and transcripts rather than the standardized financial tabs.
