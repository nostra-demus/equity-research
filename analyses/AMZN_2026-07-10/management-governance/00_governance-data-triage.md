# Governance Data Triage — AMZN

**Date:** 2026-07-04
**Ticker:** AMZN (Amazon.com, Inc., NasdaqGS)
**Data Pool:** `data/AMZN/`
**Pool Extraction:** `analyses/AMZN_2026-07-04/_pool_extracts/` — 5 workbooks → 30 tabs; 44 extracts; **0 extraction failures**

---

## 1. File Inventory

Every file in the pool is listed below. Multi-tab workbooks are expanded to one row per tab per the manifest.

| Filename / Tab | Type | Period Covered (from inside document) | File Size | Governance Relevance |
|---|---|---|---|---|
| `Amazon com Inc NasdaqGS AMZN Competitors.rtf` | Capital IQ competitor export (RTF) | As of Jul 1, 2026 (data sync) | 9.5 MB | Low |
| `Amazon com Inc NasdaqGS AMZN Customers.rtf` | Capital IQ customers export (RTF) | As of Jul 1, 2026 (data sync) | 2.8 MB | Low |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Key Stats** (91×9) | Capital IQ financials — key financials | FY2022–FY2025 annual + recent quarterly | 208 KB (parent) | Medium |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Income Statement** (120×7) | Capital IQ financials — income statement | FY2020–FY2025 annual + recent quarterly | 208 KB | Low |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Balance Sheet** (92×7) | Capital IQ financials — balance sheet | FY2020–FY2025 annual + recent quarterly | 208 KB | Medium |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Cash Flow** (70×7) | Capital IQ financials — cash flow | FY2020–FY2025 annual + recent quarterly | 208 KB | Medium |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Multiples** (91×10) | Capital IQ financials — valuation multiples | FY2020–FY2025 annual | 208 KB | Low |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Historical Capitalization** (39×7) | Capital IQ financials — share count / cap table history | FY2020–FY2025 | 208 KB | High — share count trajectory, dilution |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Capital Structure Summary** (106×7) | Capital IQ financials — debt/capital structure | FY2024–Q1 2026 | 208 KB | High — debt structure, ownership overview |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Capital Structure Details** (51×10) | Capital IQ financials — individual debt instruments | FY2024–FY2025 | 208 KB | Medium |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Ratios** (161×7) | Capital IQ financials — operating and financial ratios | FY2020–FY2025 | 208 KB | Medium |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Supplemental** (52×7) | Capital IQ financials — supplemental metrics | FY2020–FY2025 | 208 KB | Low |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Industry Specific** (21×7) | Capital IQ financials — industry metrics | FY2020–FY2025 | 208 KB | Low |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Pension OPEB** (15×6) | Capital IQ financials — pension/OPEB | FY2020–FY2025 | 208 KB | Low |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` → **Segments** (66×7) | Capital IQ financials — segment data | FY2020–FY2025 | 208 KB | Medium |
| `Amazon com Inc NasdaqGS AMZN Financials Segments.xls` → **Segments** (66×7) | Capital IQ segment financials (standalone workbook) | FY2020–FY2025 | 39 KB | Medium |
| `Amazon com Inc NasdaqGS AMZN Products.xls` → **Products** (242×5) | Capital IQ products/services listing | Current (as of Jul 1, 2026) | 135 KB | Low |
| `Amazon com Inc NasdaqGS AMZN Public Company Profile.rtf` | Capital IQ public company profile — governance, board, ownership overview | As of Jul 1, 2026 (last updated) | 284 KB | **High** — board composition, insider names, float, control structure, takeover defenses, compensation summary |
| `Amazon com Inc NasdaqGS AMZN Suppliers.rtf` | Capital IQ supplier relationships | As of Jul 1, 2026 | 3.9 MB | Low |
| `Amazon com Inc NasdaqGS AMZN Takeover Defenses.rtf` | Capital IQ takeover defenses / governance provisions | As of Jul 1, 2026 | 565 KB | **High** — board structure, classified board, shareholder rights, poison pill, voting standards |
| `Amazon-2024-Annual-Report.pdf` | Audited annual report / 10-K (US SEC) | FY ended Dec 31, 2024 (filed Feb 6, 2025) | 1.3 MB | **High** — all governance dimensions |
| `Amazon-com-Inc-2023-Annual-Report.pdf` | Audited annual report / 10-K (US SEC) | FY ended Dec 31, 2023 (filed Feb 1, 2024) | 1.3 MB | **High** — historical governance baseline |
| `Amazon.com, Inc., Q1 2026 Earnings Call, Apr 29, 2026.pdf` | Earnings transcript | Q1 2026 (quarter ended Mar 31, 2026) | 391 KB | **High** — candor, tone, promises |
| `Amazon.com, Inc., Q2 2025 Earnings Call, Jul 31, 2025 (1).pdf` | Earnings transcript (duplicate) | Q2 2025 (quarter ended Jun 30, 2025) | 396 KB | High — candor, tone |
| `Amazon.com, Inc., Q2 2025 Earnings Call, Jul 31, 2025.pdf` | Earnings transcript | Q2 2025 (quarter ended Jun 30, 2025) | 396 KB | High — candor, tone |
| `Amazon.com, Inc., Q3 2025 Earnings Call, Oct 30, 2025.pdf` | Earnings transcript | Q3 2025 (quarter ended Sep 30, 2025) | 369 KB | High — candor, tone |
| `Amazon.com, Inc., Q4 2025 Earnings Call, Feb 05, 2026.pdf` | Earnings transcript | Q4 2025 (quarter ended Dec 31, 2025) | 402 KB | High — candor, tone |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` → **Consensus** (528×121) | Capital IQ estimates — consensus analyst forecasts | FY2024–FY2028 forward; latest revision 2026-06-26 | 7.7 MB (parent) | Medium |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` → **Recent Changes** (265×10) | Capital IQ estimates — recent estimate revisions | Through 2026-06-26 | 7.7 MB | Low |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` → **Guidance** (86×107) | Capital IQ estimates — management guidance log | Through Q2 2026 guidance (Apr 29, 2026) | 7.7 MB | Medium — guidance track record |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` → **Multiples** (26×7) | Capital IQ estimates — NTM multiples | As of Jul 2026 | 7.7 MB | Low |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` → **Surprise** (256×110) | Capital IQ estimates — historical beat/miss record | Q1 2019–Q1 2026 | 7.7 MB | **High** — beat/miss track record for candor and competence assessment |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` → **Trends** (323×22) | Capital IQ estimates — revision trends | Through 2026-06-26 | 7.7 MB | Low |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` → **Revisions** (483×22) | Capital IQ estimates — individual analyst revisions | Through 2026-06-26 | 7.7 MB | Low |
| `Amazoncom_Inc-Annual_Report(Apr-09-2026).pdf` | Audited annual report / 10-K (US SEC) | FY ended Dec 31, 2025 (filed Apr 9, 2026) | 1.6 MB | **High** — most current annual governance read |
| `Amazoncom_Inc_-_Form_10-Q(Apr-30-2026).doc` | Quarterly report / 10-Q (US SEC) | Quarter ended Mar 31, 2026 (filed Apr 30, 2026) | 1.2 MB | **High** — most current insider trading, management commentary |
| `Company Comparable Analysis Amazon com Inc.xls` → **Financial Data** (50×17) | Capital IQ comparable analysis — financial data | FY2022–FY2025 + LTM | 146 KB (parent) | Low |
| `Company Comparable Analysis Amazon com Inc.xls` → **Trading Multiples** (50×9) | Capital IQ comparable analysis — trading multiples | As of Jul 2026 | 146 KB | Low |
| `Company Comparable Analysis Amazon com Inc.xls` → **Operating Statistics** (50×13) | Capital IQ comparable analysis — operating stats | FY2022–FY2025 | 146 KB | Low |
| `Company Comparable Analysis Amazon com Inc.xls` → **Business Description** (44×3) | Capital IQ comparable analysis — company descriptions | Current | 146 KB | Low |
| `Company Comparable Analysis Amazon com Inc.xls` → **Implied Valuation** (69×9) | Capital IQ comparable analysis — valuation | As of Jul 2026 | 146 KB | Low |
| `Company Comparable Analysis Amazon com Inc.xls` → **Valuation Chart** (32×2) | Capital IQ comparable analysis — chart data | As of Jul 2026 | 146 KB | Low |
| `Company Comparable Analysis Amazon com Inc.xls` → **Credit Health Panel** (48×10) | Capital IQ comparable analysis — credit metrics | FY2022–FY2025 | 146 KB | Low |
| `Company Comparable Analysis Amazon com Inc.xls` → **Disclaimer** (26×1) | Disclaimer text | — | 146 KB | Low |

**Extraction status (manifest.json):** 0 failures. All 44 extracts have status `ok`. No gdrive pointer stubs detected. No source is in a `fail`, `fallback-text`, or `missing-dependency` state. Every file counts as present.

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (10-K) | `Amazoncom_Inc-Annual_Report(Apr-09-2026).pdf` | FY Dec 31, 2025 (filed Apr 9, 2026) | ~3 months |
| Quarterly filing (10-Q) | `Amazoncom_Inc_-_Form_10-Q(Apr-30-2026).doc` | Q1 Mar 31, 2026 (filed Apr 30, 2026) | ~2 months |
| Proxy / DEF 14A | NOT IN POOL — 2025 and 2026 DEF 14A/proxy statements not present | N/A | N/A |
| Compensation disclosure | NOT IN POOL — Part III (Items 11–14) of the FY2025 10-K is incorporated by reference to the 2026 proxy; that proxy is absent; FY2024 10-K similarly defers to the 2025 proxy, also absent | N/A | N/A |
| Ownership / insider-transaction data | Partial — Capital IQ Public Company Profile contains named insiders (Bezos, Jassy) and float % (90.9%) as of Jul 1, 2026; 10-K Item 9B discloses Rule 10b5-1 plan adoptions; no standalone Schedule 13D/13G, Form 4 export, or beneficial ownership table is in the pool | Jul 1, 2026 | ~0 months |
| Shareholder letter | `Amazoncom_Inc-Annual_Report(Apr-09-2026).pdf` — Andy Jassy's annual shareholder letter appears as the opening of the FY2025 10-K (also `Amazon-2024-Annual-Report.pdf` for FY2024 letter; `Amazon-com-Inc-2023-Annual-Report.pdf` for FY2023 letter); 1997 letter reprinted | FY2025, FY2024, FY2023 | 3 months (most recent) |
| Transcript | `Amazon.com, Inc., Q1 2026 Earnings Call, Apr 29, 2026.pdf` | Q1 2026 (Apr 29, 2026) | ~2 months |
| 8-K (management changes) | NOT IN POOL as a standalone file; management-change disclosures within Q4 2025 earnings call and FY2025 10-K Item 9B | See 10-K | ~3 months |
| Board / related-party disclosure | Capital IQ Takeover Defenses RTF (Jul 1, 2026) + Capital IQ Public Company Profile (Jul 1, 2026) + FY2025 10-K board member list (Item 10 directors) — all partial; full board independence table and RPT detail are in the 2026 proxy (absent) | Jul 1, 2026 | ~0 months |

---

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A | **N** | Not in pool. Both the 2025 proxy (relating to the 2025 Annual Meeting, deferred from FY2024 10-K) and the 2026 proxy (relating to the 2026 Annual Meeting, deferred from FY2025 10-K) are absent. | Compensation detail, beneficial ownership table, board independence, related-party disclosure, auditor fees, and AGM voting outcomes all live in the proxy. |
| Compensation disclosure (metrics/weights) | **Partial** | FY2025 10-K (Apr 9, 2026) defers Items 11–14 to the 2026 proxy. The Capital IQ Takeover Defenses RTF states that compensation is tied to long-term performance "reflected primarily in the stock price" and notes RSUs as the primary vehicle. 10-K Item 9B discloses specific 10b5-1 plan adoptions (Bezos: 15M shares through Feb 2026; Jassy: 142,224 shares through Dec 2026). Stock-based compensation expense is disclosed ($24.0B in FY2025, $22.0B in FY2024, $19.5B in FY2023). However, the actual bonus metrics, weightings, and thresholds for the Leadership Development and Compensation Committee are not in the pool. | Incentive alignment — the critical question of whether comp rewards per-share value or revenue/size cannot be answered without the proxy's Compensation Discussion & Analysis. |
| Beneficial ownership table | **Partial** | Capital IQ Public Company Profile lists Bezos (Founder & Executive Chairman) and Jassy (President, CEO & Director) by name and role; float is 90.9% (as of Jul 1, 2026). Bezos's approximate 9–10% ownership and Jassy's much smaller stake are widely reported and referenced in the business-model module. However, no formal Schedule 13D/13G, no proxy beneficial ownership table (5%+ holders), and no Form 4 export is present in the pool. Ownership figures for specific holders cannot be cited to a filing in the pool. | Skin in the game, concentration of voting power, and whether controlling insiders bought or were granted their shares. |
| Insider-transaction data (buys/sells) | **Partial** | FY2025 10-K Item 9B discloses that Bezos adopted a 10b5-1 trading plan in Nov 2025 (up to 15M shares through Feb 2026) and Jassy adopted a plan in Nov 2025 (up to 142,224 shares through Dec 2026). Q4 2025 transcript and 10-K note Olsavsky terminated a prior plan. No comprehensive Form 4 transaction log or Capital IQ insider-transaction export is present. | Conviction signal — planned sales vs distress-driven sales, and net insider buying/selling over 12 months. |
| Board composition / independence | **Partial** | Capital IQ Takeover Defenses RTF states: one-year board terms (not staggered), majority voting, lead independent director provision, no classified board, no cumulative voting, 90-day advance notice for nominations, CEO succession plan exists, board performance reviews occur. FY2025 10-K signatures page lists 13 directors (Jeff Bezos — Executive Chairman; Andy Jassy — CEO/Director; 11 others). Capital IQ Public Company Profile lists Cooper (Edith W.) as Independent Director. The full board independence breakdown, committee assignments, and number of independent directors on each committee (audit, comp, nominating) are in the absent 2026 proxy. | Board quality and entrenchment risk. |
| Related-party disclosure | **Partial** | FY2025 10-K Item 13 states: "Information required by Item 13 of Part III is included in our Proxy Statement relating to our 2026 Annual Meeting of Shareholders and is incorporated herein by reference." The FY2025 10-K financial notes contain no RPT note — and explicitly state no internal revenue transactions between segments. Disqualifier scan confirmed no material RPT. | Value leakage and conflict of interest. Proxy has the full RPT table. |
| Control structure (dual-class / blocs) | **Y** | Capital IQ Takeover Defenses RTF: "Dual Class Stock" field is listed but value is blank in the extract, suggesting no dual class. Public Company Profile confirms float 90.9%, single-class common stock. FY2025 10-K cover page: one class of common stock listed on NASDAQ. Takeover Defenses export states "Active Poison Pill" — value appears blank/inapplicable. No super-voting or dual-class structure is present. Bezos's control is through a large but not dominant economic interest (~9–10%), not a structural voting bloc. | Minority-shareholder rights and control abuse risk. |
| Prior shareholder letters / guidance | **Y** | Three consecutive annual shareholder letters in pool: Andy Jassy's FY2025 letter (filed Apr 9, 2026), FY2024 letter (filed Feb 6, 2025), and FY2023 letter (filed Feb 1, 2024). The 1997 Jeff Bezos letter reprinted in each 10-K provides a philosophical baseline. Five earnings call transcripts cover Q2 2025 through Q1 2026. Capital IQ Guidance tab and Surprise tab provide historical guidance-vs-actual data. | Promise-vs-delivery testing — the core management track record check. |
| M&A / buyback / dividend history | **Y** | FY2023, FY2024, FY2025 10-K cash flow statements and notes; Capital IQ Financials (Cash Flow, Capital Structure) cover FY2020–Q1 2026. Business-model module `11_capital-allocation-governance.md` has already extracted the multi-year capital allocation scorecard. Key facts confirmed: no dividends ever paid; $10B buyback authorized Mar 2022, only $3.9B used, $6.1B unused; shares outstanding rose 3.4% over two years from RSU vesting; acquisitions small (One Medical $3.5B in FY2023, bolt-ons thereafter). | Capital-allocation scorecard: per-share discipline. |
| Management tenure / turnover | **Y** | FY2025 10-K Item 1 discloses executive officers and directors as of Jan 2026. Andy Jassy has been CEO since July 2021; Brian Olsavsky CFO since 2015; Jeff Bezos Executive Chairman since 2021. No CEO, CFO, or board chair change in the last three years. The FY2025 10-K lists all current executive officers with tenure dates. | Stability and competence. |
| Transcripts | **Y** | Five call transcripts in pool: Q2 2025 (Jul 31, 2025), Q3 2025 (Oct 30, 2025), Q4 2025 (Feb 5, 2026), Q1 2026 (Apr 29, 2026), plus Q2 2025 duplicate. Coverage spans four consecutive quarters through Q1 2026. | Candor, tone, ownership of misses, and commitment tracking. |

---

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| `business-model/11_capital-allocation-governance.md` | **Y** — present at `analyses/AMZN_2026-07-03/business-model/11_capital-allocation-governance.md`; capital allocation score 62/100 already computed; key signals extracted |
| `business-model/01_disqualifier-scan.md` | **Y** — present; all 8 disqualifiers clear; no hard verdict lock; verdict: "Proceed to deeper analysis" |
| `business-model/12_red-flags-sweep.md` | **Y** — present; Anthropic investment (Level 3, $60.6B combined, flowing through net income) flagged at severity 62; litigation overhang severity 58; semiconductor dependency severity 52; useful-life accounting reversal severity 30 |
| `business-model/02_business-identity.md` | **Y** — present; AMZN classified as multi-sided platform and cloud infrastructure conglomerate; US GAAP; USD; fiscal year Dec 31; single class common stock |
| `earnings/06_earnings-quality.md` | **Y** — present; CFO/EBITDA 95%+ (FY2023–FY2025); DPO expansion flag (+18.3% in FY2025); FCF compressed by capex surge; GAAP net income partially fictitious due to Anthropic Level 3 marks; key finding: use operating income and CFO, not GAAP net income |
| `earnings/04_guidance-consensus.md` | **Y** — present; Amazon provides one-quarter-forward revenue and operating income guidance only; guidance-vs-actual track record in pool via Capital IQ Surprise tab (Q1 2019–Q1 2026) |

All six cross-module outputs are available. No upstream gaps.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | **Y** — Both the 2025 and 2026 DEF 14A proxy statements are absent from the data pool. The FY2025 and FY2024 10-Ks incorporate Part III by reference to those proxies. Compensation Discussion & Analysis (actual metrics, weights, thresholds), beneficial ownership table (named holders with exact %s), director independence breakdown, AGM voting outcomes, and RPT detail are all in those absent proxies. | Agents 03 (incentives), 05 (board), 99 (synthesis) | Incentive alignment max 50; Overall usefulness max 70 |
| No ownership / insider-transaction data | **Partial (not full cap)** — Ownership is partially available: float 90.9% (Capital IQ), named insiders (Bezos, Jassy), 10b5-1 plan disclosures in 10-K Item 9B. No complete beneficial ownership table, no Form 4 transaction log, no Capital IQ insider-transaction export. The cap applies but evidence available allows a partial read. | Agent 04 (ownership), 99 (synthesis) | Shareholder friendliness max 60 |
| No board disclosure | **Partial (not full cap)** — Board composition is partially available from Capital IQ Takeover Defenses (structure, voting standards, classified-board status) and FY2025 10-K signatures (13 directors named). Full independence table, committee membership, non-audit fees, and AGM director vote results are in the absent proxy. | Agent 05 (board), 99 (synthesis) | Board independence detail not fully assessable; cap at 60 for that sub-dimension |
| No multi-year history | **N** — Three consecutive annual 10-Ks (FY2023, FY2024, FY2025) are in the pool plus Q1 2026 10-Q. Capital IQ financials span FY2020–FY2025. Multi-year capital allocation history is present. Business-model module has already computed the scorecard. | Agent 02 | No cap — multi-year history is adequate |
| No transcripts / prior letters | **N** — Five transcripts (Q2 2025–Q1 2026) and three annual shareholder letters (FY2023–FY2025) are in the pool. | Agents 01, 06 | No cap — transcripts and letters are present |

---

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | Capital IQ Public Company Profile: "Country/Region of Incorporation: United States"; NasdaqGS:AMZN |
| Exchange | NASDAQ Global Select (NasdaqGS) | Capital IQ Public Company Profile; FY2025 10-K cover page |
| Filing regime | **US SEC** — 10-K (annual), 10-Q (quarterly), 8-K (material events), DEF 14A (proxy), Form 4 (insider transactions), Schedule 13D/13G (beneficial ownership) | FY2025 10-K filed Apr 9, 2026 (EDGAR); Q1 2026 10-Q filed Apr 30, 2026 |
| Sector | Broadline Retail (primary SIC); diversified into cloud computing (AWS) and advertising | Capital IQ Public Company Profile: "Primary Industry Classification: Broadline Retail" |
| Sector-specific governance overlay required? | **N** — Amazon is not a bank, NBFC, insurer, IT-services pure-play, pharma, infra/real estate, or holding company under the MODULE_RULES overlays. The broadline retail + cloud platform classification does not trigger any of the five sector-specific overlays. Agents should note the Anthropic investment (a significant private equity holding with Level 3 accounting) creates a de-facto quasi-financial-holding characteristic at the net-income line — this is flagged in `12_red-flags-sweep.md` and agents 02 and 06 should reference it for candor and accounting quality. | MODULE_RULES.md Sector Overlays; `12_red-flags-sweep.md` |
| Document language(s) | English (all documents) | All filings are in English; no non-English documents in pool |

No jurisdiction-mapping gap: AMZN is a US issuer. US form names (10-K, 10-Q, DEF 14A, Form 4) are the actual applicable forms, not examples. The proxy (DEF 14A) is genuinely absent from the pool — this is a real data gap, not a §27 non-US misclassification error.

---

## Language is not a data gap (CLAUDE.md §27)

All documents in this pool are in English (the company's filing language). No non-English source is present. The language rule (§27) does not create any data-sufficiency adjustment here. The single genuine language consideration would arise if Amazon's India or Germany subsidiary filings were in the pool (they are not) — in that case, those would count as present at their tier regardless of language.

---

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---:|---|---|
| Board composition | Capital IQ Takeover Defenses RTF + FY2025 10-K signatures | Jul 1, 2026 / Feb 2026 | 3 | Partial — independence breakdown missing | 2026 DEF 14A (absent) |
| Compensation (metrics, weights, thresholds) | Capital IQ Takeover Defenses RTF (high-level only: "tied to long-term performance / stock price") | Jul 1, 2026 | 2 | **YES** — Compensation Discussion & Analysis absent | 2026 DEF 14A (absent) |
| Ownership (named holders + %) | Capital IQ Public Company Profile (Bezos, Jassy named; float 90.9%) + 10-K Item 9B 10b5-1 disclosures | Jul 1, 2026 / Apr 9, 2026 | 3 | Partial — formal beneficial ownership table absent | 2026 DEF 14A / Schedule 13G (absent) |
| Insider trades | FY2025 10-K Item 9B (10b5-1 plan adoptions for Bezos, Jassy, Olsavsky) | Nov 2025 – Dec 2026 plans | 4 | Partial — comprehensive Form 4 log absent | Form 4 filings on EDGAR (not in pool) |
| Related-party transactions | FY2025 10-K Note (no RPT in notes); disqualifier scan confirmed no material RPTs | FY2025 | 4 | Partial — proxy RPT table absent; filings are clean | 2026 DEF 14A Item 13 (absent) |
| Auditor report | FY2025 10-K (Ernst & Young, unqualified opinion, filed Apr 9, 2026) | FY Dec 31, 2025 | 5 | No | Fully in pool |
| Secretarial / compliance report | N/A — not applicable for US SEC filers | — | N/A | N/A | N/A |
| AGM voting | NOT IN POOL — no 2025 or 2026 proxy or voting results | N/A | — | **YES** | 2025/2026 DEF 14A / 8-K Form 8-K voting results (absent) |
| Capital-allocation history | FY2023, FY2024, FY2025 10-Ks + Capital IQ Cash Flow / Capital Structure / Supplemental tabs + business-model cross-module `11` | FY2020–Q1 2026 | 5 | No | Fully in pool |
| Legal / regulatory cases | FY2025 10-K Note 7 (Commitments and Contingencies, Legal Proceedings); red-flags-sweep cross-module | FY2025 (filed Apr 9, 2026) | 5 | No | Fully in pool |

---

## 5C. Data Freshness

| Source | Period | As-of Date | Age (months) | Stale? | Impact |
|---|---|---|---|---|---|
| FY2025 10-K (`Amazoncom_Inc-Annual_Report(Apr-09-2026).pdf`) | FY Dec 31, 2025 | Filed Apr 9, 2026 | ~3 months | No | Anchor governance read |
| Q1 2026 10-Q (`Amazoncom_Inc_-_Form_10-Q(Apr-30-2026).doc`) | Q ended Mar 31, 2026 | Filed Apr 30, 2026 | ~2 months | No | Most current financial data point |
| Q1 2026 Earnings Call transcript | Apr 29, 2026 | Apr 29, 2026 | ~2 months | No | Most current management tone |
| Q2 2025 / Q3 2025 / Q4 2025 transcripts | Jul–Feb | Jul 31 / Oct 30, 2025 / Feb 5, 2026 | 5–11 months | No — within the 12-month window | Candor pattern assessment |
| FY2024 10-K (`Amazon-2024-Annual-Report.pdf`) | FY Dec 31, 2024 | Filed Feb 6, 2025 | ~17 months | Superseded by FY2025 10-K for current state; valuable for multi-year track record | Medium — historical baseline |
| FY2023 10-K (`Amazon-com-Inc-2023-Annual-Report.pdf`) | FY Dec 31, 2023 | Filed Feb 1, 2024 | ~29 months | Stale for current governance state; valuable as historical baseline | Low-Medium — 3-year trend |
| Capital IQ Public Company Profile (RTF) | Current | Jul 1, 2026 | ~3 days | No | Ownership / board overview current |
| Capital IQ Takeover Defenses (RTF) | Current | Jul 1, 2026 | ~3 days | No | Board structure / provisions current |
| Capital IQ Financials workbook | FY2020–FY2025 + Q1 2026 | Apr 30, 2026 (filing date basis) | ~2 months | No | Financial data for capital allocation |
| Capital IQ Estimates Report | Latest revision Jun 26, 2026 | Jun 26, 2026 | ~1 week | No | Guidance track record, beat/miss history |
| DEF 14A / Proxy (2025 and 2026) | N/A — NOT IN POOL | N/A | N/A | N/A — absent, not stale | **Critical gap** |

Source manifest CSV export: the framework does not support direct file output by this subagent; the table above is the equivalent manifest. CSV export marked **pending** for the orchestrator.

---

## 6. Sufficiency Verdict

- **Verdict: Partial**

- **Reason:** The three most recent annual 10-Ks, the Q1 2026 10-Q, five earnings transcripts, three shareholder letters, and rich Capital IQ financials / governance exports are in the pool and support a thorough read of management track record, capital allocation, and disclosure candor — but both the 2025 and 2026 DEF 14A proxy statements are absent, leaving compensation discussion and analysis (exact metrics, weightings, thresholds), the formal beneficial ownership table (exact percentage holdings for named insiders and 5%+ institutional holders), committee-level board independence, AGM voting outcomes, and the full RPT table either missing or only partially reconstructible from other sources.

- **Specialists that can run:**
  - Management track record (agent 01) — **Yes, fully**; multi-year 10-K history, shareholder letters, transcripts, cross-module `01_disqualifier-scan` and `04_guidance-consensus` all available.
  - Capital allocation scorecard (agent 02) — **Yes, fully**; three years of 10-K cash flows, Capital IQ financials, and cross-module `11_capital-allocation-governance` provide a complete multi-year picture.
  - Incentives and compensation (agent 03) — **Partial**; can assess the structure (RSU-dominant, no options, high SBC quantum) and the 10b5-1 plan disclosures, but cannot state the actual performance metrics or weightings without the proxy. Hard cap applies.
  - Ownership and insider behavior (agent 04) — **Partial**; named insiders and float are available; 10b5-1 plan activity is disclosed in the 10-K; formal ownership percentages from the proxy are absent. Cap applies but meaningful inference is possible.
  - Board and shareholder rights (agent 05) — **Partial**; board structure (13 directors, 1-year terms, majority voting, no classified board, no dual class, lead independent director) is available from Capital IQ and 10-K; full independence breakdown and committee composition require the absent proxy. Cap applies.
  - Candor and disclosure quality (agent 06) — **Yes, largely**; five transcripts, three shareholder letters, historical beat/miss data (Capital IQ Surprise tab), earnings-quality cross-module, and guidance-consensus cross-module all available.

- **Hard disqualifier already flagged by `business-model/01_disqualifier-scan`?** **No.** All 8 disqualifiers clear. No verdict lock. The disqualifier scan verdict is: "No disqualifier triggered. Proceed to deeper analysis."

- **Active partial-data caps:**
  - Incentive alignment score: **max 50** (no proxy / compensation disclosure)
  - Overall usefulness score: **max 70** (no proxy / compensation disclosure)
  - Shareholder friendliness score: **max 60** (no complete ownership / insider-transaction data)
  - Board-independence sub-dimension: **not fully assessable** — cap board quality at 60 for the independence-and-committee dimension specifically; the structural governance read (no dual class, no staggered board, majority voting, annual terms) is assessable and positive

- **Critical missing items:**
  - 2026 DEF 14A proxy statement (relates to 2025 fiscal year, filing due within 120 days of Dec 31, 2025 — expected by Apr 29, 2026; likely filed by now on EDGAR but not in the data pool)
  - 2025 DEF 14A proxy statement (relates to 2024 fiscal year)
  - Form 4 insider-transaction log (complete 12-month buy/sell history for named insiders)
  - Beneficial ownership table (exact % holdings for Bezos, Jassy, and institutional holders ≥5%)
  - AGM voting results (votes for/against on compensation, director elections, shareholder proposals)

- **Single highest-value missing document:** 2026 DEF 14A proxy statement — it would supply compensation metrics and weightings, the beneficial ownership table, board independence breakdown, committee composition, AGM voting results, auditor fee analysis, and the RPT table in a single document.
