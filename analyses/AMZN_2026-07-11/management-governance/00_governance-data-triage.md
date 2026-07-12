# Governance Data Triage — AMZN

**Date:** 2026-07-11
**Ticker:** AMZN (NasdaqGS)
**Data Pool:** `data/AMZN/`
**Extractor run:** `analyses/AMZN_2026-07-11/_pool_extracts/` — 5 workbooks → 30 tabs; 45 extract files; 0 failures

---

## 1. File Inventory

All files in `data/AMZN/` are listed below. Every workbook tab is its own row per the manifest. Periods are parsed from inside each document; file-modified dates are noted but NOT used for sufficiency judgments (they reflect sync dates, not document age). No file is left as a single opaque row.

| Filename | Type | Tab / Stream | Rows×Cols | Period Covered (internal) | File Last Modified | Governance Relevance |
|---|---|---|---|---|---|---|
| `Amazoncom_Inc-Annual_Report(Apr-09-2026).pdf` | Audited annual report (10-K, US SEC) | — | — | FY2025 (year ended Dec 31, 2025; filed Apr 9, 2026) | Jul 1 2026 | **High** — primary governance source; executive officers, board, compensation reference (proxy), capital allocation, risk factors |
| `Amazon-2024-Annual-Report.pdf` | Audited annual report (10-K, US SEC) | — | — | FY2024 (year ended Dec 31, 2024; filed Feb 6, 2025) | Jul 1 2026 | **High** — multi-year governance baseline |
| `Amazon-com-Inc-2023-Annual-Report.pdf` | Audited annual report (10-K, US SEC) | — | — | FY2023 (year ended Dec 31, 2023; filed Feb 1, 2024) | Jul 1 2026 | **High** — three-year governance track record anchor |
| `Amazoncom_Inc_-_Form_10-Q(Apr-30-2026).doc` | Quarterly filing (10-Q, US SEC, MHTML) | — | — | Q1 2026 (quarter ended Mar 31, 2026; filed Apr 30, 2026) | Jul 1 2026 | **Medium** — most recent capital structure, commitments |
| `Amazon.com, Inc., Q1 2026 Earnings Call, Apr 29, 2026.pdf` | Earnings transcript | — | — | Q1 2026 (Apr 29, 2026) | Jul 1 2026 | **High** — candor, tone, capital allocation commentary |
| `Amazon.com, Inc., Q4 2025 Earnings Call, Feb 05, 2026.pdf` | Earnings transcript | — | — | Q4 2025 / FY2025 (Feb 5, 2026) | Jul 1 2026 | **High** — full-year management commentary |
| `Amazon.com, Inc., Q3 2025 Earnings Call, Oct 30, 2025.pdf` | Earnings transcript | — | — | Q3 2025 (Oct 30, 2025) | Jul 1 2026 | **High** — guidance track, candor |
| `Amazon.com, Inc., Q2 2025 Earnings Call, Jul 31, 2025.pdf` | Earnings transcript | — | — | Q2 2025 (Jul 31, 2025) | Jul 1 2026 | **Medium** — candor, promise-vs-delivery |
| `Amazon.com, Inc., Q2 2025 Earnings Call, Jul 31, 2025 (1).pdf` | Earnings transcript (duplicate) | — | — | Q2 2025 (Jul 31, 2025) | Jul 1 2026 | **Low** — duplicate of above |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook (multi-tab) | Key Stats | 91×9 | FY2022–FY2025 + LTM Mar-31-2026; estimates to FY2028 | Jul 1 2026 | **Medium** — share count, EPS trend |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Income Statement | 120×7 | FY2022–FY2025 + LTM Mar-31-2026 | Jul 1 2026 | **Medium** — SBC expense, operating leverage |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Balance Sheet | 92×7 | FY2022–FY2025 + LTM Mar-31-2026 | Jul 1 2026 | **Medium** — capital structure baseline |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Cash Flow | 70×7 | FY2022–FY2025 + LTM Mar-31-2026 | Jul 1 2026 | **Medium** — CFO/capex for allocation scorecard |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Multiples | 91×10 | FY2022–FY2025 + LTM Mar-31-2026 | Jul 1 2026 | **Low** — valuation reference |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Historical Capitalization | 39×7 | FY2022–FY2025 + LTM Mar-31-2026 | Jul 1 2026 | **Medium** — shares outstanding history |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Capital Structure Summary | 106×7 | FY2024–FY2025 + Q1 2026 | Jul 1 2026 | **Medium** — debt composition, net debt |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Capital Structure Details | 51×10 | FY2024–FY2025 + Q1 2026 | Jul 1 2026 | **Medium** — debt instruments detail |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Ratios | 161×7 | FY2022–FY2025 + LTM Mar-31-2026 | Jul 1 2026 | **Medium** — ROIC, payout, efficiency |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Supplemental | 52×7 | FY2020–FY2025 | Jul 1 2026 | **High** — SBC expense FY2020–2025 (alignment proxy) |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Industry Specific | 21×7 | FY2022–FY2025 | Jul 1 2026 | **Low** — retail-specific metrics |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Pension OPEB | 15×6 | FY2022–FY2025 | Jul 1 2026 | **Low** — pension (immaterial) |
| `Amazon com Inc NasdaqGS AMZN Financials.xls` | CIQ financial workbook | Segments | 66×7 | FY2022–FY2025 | Jul 1 2026 | **Medium** — segment capital allocation |
| `Amazon com Inc NasdaqGS AMZN Financials Segments.xls` | CIQ segment workbook | Segments | 66×7 | FY2022–FY2025 | Jul 1 2026 | **Medium** — segment revenue/profit |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` | CIQ estimates workbook | Consensus | 528×121 | FY2024–FY2027 estimates | Jul 1 2026 | **Low** — forward estimates |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` | CIQ estimates workbook | Recent Changes | 265×10 | Recent revisions (data as of ~Jul 3, 2026) | Jul 1 2026 | **Low** — estimate revision signal |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` | CIQ estimates workbook | Guidance | 86×107 | FY2024–FY2026 guidance history | Jul 1 2026 | **Medium** — guidance accuracy for promise-vs-delivery |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` | CIQ estimates workbook | Multiples | 26×7 | LTM estimates | Jul 1 2026 | **Low** — valuation reference |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` | CIQ estimates workbook | Surprise | 256×110 | Historical beat/miss by period | Jul 1 2026 | **Medium** — guidance accuracy |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` | CIQ estimates workbook | Trends | 323×22 | Revision trends | Jul 1 2026 | **Low** — estimate momentum |
| `Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls` | CIQ estimates workbook | Revisions | 483×22 | Analyst revisions | Jul 1 2026 | **Low** — estimate momentum |
| `Company Comparable Analysis Amazon com Inc.xls` | CIQ peer comp workbook | Financial Data | 50×17 | FY2023–FY2025 peers | Jul 1 2026 | **Medium** — peer governance benchmarking |
| `Company Comparable Analysis Amazon com Inc.xls` | CIQ peer comp workbook | Trading Multiples | 50×9 | LTM peers | Jul 1 2026 | **Low** — valuation reference |
| `Company Comparable Analysis Amazon com Inc.xls` | CIQ peer comp workbook | Operating Statistics | 50×13 | FY2023–FY2025 peers | Jul 1 2026 | **Medium** — peer capex/ROIC |
| `Company Comparable Analysis Amazon com Inc.xls` | CIQ peer comp workbook | Business Description | 44×3 | As-of pull date | Jul 1 2026 | **Low** — background |
| `Company Comparable Analysis Amazon com Inc.xls` | CIQ peer comp workbook | Implied Valuation | 69×9 | LTM | Jul 1 2026 | **Low** — valuation reference |
| `Company Comparable Analysis Amazon com Inc.xls` | CIQ peer comp workbook | Valuation Chart | 32×2 | LTM | Jul 1 2026 | **Low** — valuation reference |
| `Company Comparable Analysis Amazon com Inc.xls` | CIQ peer comp workbook | Credit Health Panel | 48×10 | FY2023–FY2025 peers | Jul 1 2026 | **Medium** — debt/covenant peer context |
| `Company Comparable Analysis Amazon com Inc.xls` | CIQ peer comp workbook | Disclaimer | 26×1 | — | Jul 1 2026 | **Low** |
| `Amazon com Inc NasdaqGS AMZN Products.xls` | CIQ product list | Products | 242×5 | As-of pull date | Jul 1 2026 | **Low** — business context only |
| `Amazon com Inc NasdaqGS AMZN Takeover Defenses.rtf` | CIQ governance/takeover-defense export | — | — | As-of pull date (data includes board structure, voting rights, charter/bylaw provisions) | Jul 1 2026 | **High** — board structure, shareholder rights, anti-takeover provisions |
| `Amazon com Inc NasdaqGS AMZN Public Company Profile.rtf` | CIQ company profile | — | — | As-of Jul 1, 2026 (float 90.9%, last price $238.34) | Jul 1 2026 | **High** — float %, key professionals, investor list |
| `Amazon com Inc NasdaqGS AMZN Competitors.rtf` | CIQ competitor list | — | — | As-of pull date | Jul 1 2026 | **Low** — peer identification |
| `Amazon com Inc NasdaqGS AMZN Customers.rtf` | CIQ customer list | — | — | As-of pull date | Jul 1 2026 | **Low** — business context |
| `Amazon com Inc NasdaqGS AMZN Suppliers.rtf` | CIQ supplier list | — | — | As-of pull date | Jul 1 2026 | **Low** — business context |
| `Memos 2026-07-11 00-12-21/AMZN - Full Dossier.md` | Prior research output (engine memo) | — | — | 2026-07-11 (engine-generated) | Jul 11 2026 | **Low** — prior engine synthesis; not a primary source |
| `Memos 2026-07-11 00-12-21/AMZN - Investment Thesis.md` | Prior research output (engine memo) | — | — | 2026-07-11 (engine-generated) | Jul 11 2026 | **Low** — prior engine synthesis; not a primary source |
| `Memos 2026-07-11 00-12-21/AMZN - Memo.md` | Prior research output (engine memo) | — | — | 2026-07-11 (engine-generated) | Jul 11 2026 | **Low** — prior engine synthesis; not a primary source |

**Extraction status:** 0 failures in the pool manifest. All 45 extracts carry status `ok`. No source is in a `fail`, `fallback-text`, or `missing-dependency` state. No gdrive-pointer stubs detected.

**ciq_facts.json sidecar:** Not present at `analyses/AMZN_2026-07-11/_pool_extracts/ciq_facts.json`. Using own sourced reads from the CIQ workbook tabs directly.

---

## 1A. External Data

| Filename | Provider | Source Type | §4 Tier | As-of Date | Notes |
|---|---|---|---|---|---|
| `external/yipitdata/Cloud (AWS, Azure, GCP) _ Mar-26 Update.pdf` | YipitData | alt_data_panel | 5 | 2026-03 (published 2026-04-16; received 2026-07-11) | AWS cloud revenue panel; subscriber-only licensed; estimate-based (vendor error margin not stated in sidecar). **Fresher than the latest earnings call only by reference to Mar-26 cloud run-rate data.** Not a filing substitute; enrichment only. |

External data does not move the sufficiency verdict. Its absence is not a gap.

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months from 2026-07-11) |
|---|---|---|---|
| Annual filing (10-K) | `Amazoncom_Inc-Annual_Report(Apr-09-2026).pdf` | FY2025 (year ended Dec 31, 2025; filed Apr 9, 2026) | ~3 months |
| Quarterly filing (10-Q) | `Amazoncom_Inc_-_Form_10-Q(Apr-30-2026).doc` | Q1 2026 (quarter ended Mar 31, 2026; filed Apr 30, 2026) | ~2.5 months |
| Proxy / DEF 14A | NOT IN POOL — 10-K Items 10–14 are incorporated by reference to the 2026 proxy (Amazon's Annual Meeting 2026); proxy not provided | 2026 proxy (expected May 2026) | N/A — not in pool |
| Compensation disclosure | PARTIAL — SBC expense from CIQ Supplemental tab (FY2020–FY2025); 10-K states RSUs as primary vehicle and references proxy for full CD&A; no proxy in pool | CIQ as of Apr 2026 / FY2025 10-K | ~3 months (SBC data); proxy (CD&A) missing |
| Ownership / insider-transaction data | PARTIAL — CIQ Public Company Profile (float 90.9% as of Jul 1, 2026; Bezos listed as Founder/Executive Chair; investor list); 10-K Item 9B discloses 10b5-1 plans (Bezos sell up to 15M shares, Jassy 142K shares); no dedicated Form 4 / Schedule 13D ownership table export in pool | As of Jul 1, 2026 (CIQ profile) | ~0 months (CIQ); no quantified beneficial-ownership table |
| Shareholder letter | `Amazoncom_Inc-Annual_Report(Apr-09-2026).pdf` (Andy Jassy's FY2025 letter included in annual report; 1997 letter appended) | FY2025 (Apr 9, 2026) | ~3 months |
| Earnings transcripts | `Amazon.com, Inc., Q1 2026 Earnings Call, Apr 29, 2026.pdf` | Q1 2026 (Apr 29, 2026) | ~2.5 months |
| 8-K (management changes) | NOT IN POOL — no Form 8-K current-report file present | N/A | N/A |
| Board / governance disclosure | `Amazon com Inc NasdaqGS AMZN Takeover Defenses.rtf` + board composition table in FY2025 10-K (pp. 734) | As of Jan 28, 2026 (10-K) / CIQ pull date ~Jul 1, 2026 | ~3 months |

---

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A | **N** | 10-K Items 10–14 are incorporated by reference to the 2026 DEF 14A; the proxy is not in the pool | Compensation discussion, beneficial ownership table, director independence certifications, related-party disclosures are ALL in the proxy; their absence limits several agents |
| Compensation disclosure (metrics/weights) | **Partial** | SBC expense FY2020–2025 from CIQ Supplemental tab; FY2025 10-K notes RSUs as "primary vehicle" and that comp is tied to long-term performance / stock price; CIQ Takeover Defenses RTF confirms LDCC structures exec comp for long-term TSR; Proxy (full CD&A with actual metric weights, peer benchmarks, CEO/CFO total pay) not in pool | Full incentive alignment assessment requires proxy CD&A; partial read possible |
| Beneficial ownership table | **Partial** | CIQ Public Company Profile: float 90.9% (Jul 1, 2026), Bezos listed as Founder/Executive Chair; FY2025 10-K Item 9B discloses Bezos 10b5-1 plan to sell up to 15M shares (Nov 2025); no structured ownership table with % held per insider | Skin-in-the-game calculation and insider-conviction assessment require quantified % ownership; ~9% Bezos stake is a common market estimate (Inference, not confirmed in pool) |
| Insider-transaction data (buys/sells) | **Partial** | FY2025 10-K Item 9B: Bezos sell plan (15M shares), Jassy sell plan (142,224 shares), Olsavsky plan termination; no dedicated Form 4 export or CIQ Insider Transactions tab in pool | Direction is known (orderly planned sales, no large buying), quantum is disclosed in the 10-K for recent plans; full transaction-level history not available |
| Board composition / independence | **Y** | FY2025 10-K pp. 734: 12-person board — Jeffrey Bezos (Executive Chair), Andrew Jassy (President & CEO), plus 10 named independent directors (Alexander, Cooper, Gorelick, Huttenlocher, Ng, Nooyi, Rubinstein, Smith, Stonesifer, Weeks); CIQ Takeover Defenses confirms annual election, no classified board, majority-vote standard, independent director executive sessions | Board structure is readable; independence certification and committee memberships are in the missing proxy |
| Related-party disclosure | **Partial** | FY2025 10-K Item 13 incorporated by reference to 2026 proxy; no material RPTs disclosed in financial notes or MD&A; disqualifier-scan confirmed no RPTs near materiality threshold | Formal Item 13 disclosure in proxy not available, but filing-level review shows no red flags; residual risk is low |
| Control structure (dual-class / blocs) | **Y** | CIQ Takeover Defenses: single share class, no cumulative voting, no supermajority requirements, annual director elections (1-year terms), majority-vote director election standard; no dual-class structure at Amazon | Amazon is a standard single-class structure with Bezos as the largest but non-controlling economic holder |
| Prior shareholder letters / guidance | **Y** | FY2025, FY2024, FY2023 annual reports all contain management letters; 1997 letter appended to FY2025 report; Q1–Q4 2025 and Q1 2026 earnings transcripts provide guidance history; CIQ Estimates Guidance tab covers FY2024–FY2026 guidance vs actuals | Full promise-vs-delivery read possible |
| M&A / buyback / dividend history | **Y** | FY2025 10-K Note 5 (acquisitions), Note 8 (stock repurchase — $10B program, none executed 2023–2025, $6.1B remaining); CIQ Cash Flow and Capital Structure tabs; five-year capex/FCF from CIQ Supplemental | Capital-allocation scorecard fully buildable |
| Management tenure / turnover | **Y** | FY2025 10-K: executive officer table as of Jan 28, 2026 (Bezos since 1994 as Chair, Jassy as CEO since Jul 2021, Olsavsky as CFO since 2015); no CEO/CFO/Chair change in last 3 years | Stability and competence read is solid |
| Transcripts | **Y** | Five transcripts in pool: Q1 2026 (Apr 29, 2026), Q4 2025 (Feb 5, 2026), Q3 2025 (Oct 30, 2025), Q2 2025 (Jul 31, 2025), Q2 2025 duplicate | Candor assessment, tone tracking, and promise-vs-delivery read all possible |

---

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| `business-model/11_capital-allocation-governance.md` | **Y** — present at `analyses/AMZN_2026-07-10/business-model/11_capital-allocation-governance.md`; capital allocation score 62/100; 13-signal quick-read completed |
| `business-model/01_disqualifier-scan.md` | **Y** — present; all 8 disqualifiers clear; no verdict lock; no hard governance disqualifier flagged |
| `business-model/12_red-flags-sweep.md` | **Y** — present; key flags: Anthropic Level 3 investment ($60.6B, earnings volatility); litigation overhang ($673M+ Kove + multi-jurisdiction antitrust); semiconductor concentration; $439.7B fixed commitments; India VIE-like structure; server useful-life flip-flop |
| `business-model/02_business-identity.md` | **Y** — present; US-listed (NASDAQ), single-class shares, Bezos Executive Chair / Jassy CEO, three-segment structure |
| `earnings/06_earnings-quality.md` | **Y** — present; CFO/EBITDA 95–99% (Green, no candor flag); SBC $19.5B FY2025 (real dilution cost); FCF suppressed by deliberate capex surge; Anthropic Level 3 gains distort GAAP net income |
| `earnings/04_guidance-consensus.md` | **Y** — present; management provides only quarterly revenue and operating-income guidance; beat-miss history computable from Estimates export |

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure (no DEF 14A in pool) | **Y** — 2026 proxy not in pool; CD&A, full ownership table, committee charters, and formal RPT disclosure all missing | 03, 99 | Incentive alignment max 50; Overall usefulness max 70 |
| No ownership / insider-transaction data (no Form 4 / dedicated ownership export) | **Y — Partial** — no structured Form 4 or CIQ Insider Transactions export; beneficial-ownership table absent; only 10b5-1 disclosures in 10-K and CIQ float % | 04, 99 | Shareholder friendliness max 60 (cap applies until beneficial-ownership quantification is confirmed) |
| No board disclosure | **N** — board composition table in FY2025 10-K; CIQ Takeover Defenses provides governance provisions; committee membership/independence certification in missing proxy but board identity and structure are known | — | No cap; independence detail limited but not blocking |
| No multi-year capital-allocation history | **N** — CIQ Cash Flow/Supplemental covers FY2020–FY2025; three annual 10-Ks + 10-Q available; full five-year scorecard buildable | — | No cap; full history available |
| No transcripts / prior letters | **N** — five quarterly transcripts available (Q2 2025 – Q1 2026) plus three annual shareholder letters (FY2023–FY2025) | — | No cap; promise-vs-delivery and candor reads fully possible |

---

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | CIQ Public Company Profile: "NasdaqGS: AMZN", incorporated in Delaware; 10-K cover page |
| Exchange | NASDAQ Global Select Market (NasdaqGS) | CIQ profile; filing cover pages |
| Filing regime | US SEC (10-K, 10-Q, DEF 14A, Form 4, 8-K) | All filings reference SEC; US GAAP; FY ends December 31 |
| Sector | Broadline Retail (primary SIC); also Technology / Cloud (AWS); Advertising | CIQ primary industry: Broadline Retail; S&P 500 Consumer Discretionary; AWS = Technology |
| Sector-specific governance overlay required? | **Yes — Conglomerate / Platform overlay**: Amazon operates three economically distinct businesses (Stores, Advertising, AWS). The conglomerate/holdco overlay applies for sub-segment capital allocation and potential value-leakage between segments (though no RPT segment transactions are disclosed). Standard retail, tech, and infrastructure overlays all relevant; no NBFC/pharma/infra-real-estate overlay needed. | FY2025 10-K Note 10 — Segment Information; business-model/02_business-identity.md |
| Document language(s) | English | All pool documents are in English; no translation required. Non-English subsidiary disclosures (India, Germany, etc.) are not separately in the pool. |

US filing regime confirmed: US SEC forms apply. DEF 14A is the correct proxy equivalent; Form 4 is the correct insider-transaction equivalent; Schedule 13D/13G for ownership. These are not "missing" as jurisdictional gaps — they are simply not in the pool. For Amazon as a US issuer, the relevant sources ARE the US forms and their absence is a real (not jurisdictional) data gap.

---

## Language is not a data gap (CLAUDE.md §27)

All documents in the pool are in English. No non-English filing is present. This section is noted for completeness; no language-based adjustment is required or applied.

---

## External data (frameworks/EXTERNAL_DATA.md)

One external document is present (see Section 1A above). YipitData Cloud panel (AWS, Azure, GCP) — Mar-26 Update — is a licensed alt-data panel (§4 tier 5). Its as-of date (Mar 2026) is roughly contemporary with the Q1 2026 10-Q (Mar 31, 2026). It is not fresher than the most recent filing. It provides AWS cloud run-rate enrichment for downstream analysts but does not substitute for any filing, transcript, or proxy slot. It does not move the sufficiency verdict.

---

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---:|---|---|
| Board composition | FY2025 10-K, executive officers and directors table, pp. 734 | As of Jan 28, 2026 | 5 | N (identity/composition); partial (committee memberships in missing proxy) | CIQ Takeover Defenses (provisions confirmed) |
| Compensation | CIQ Supplemental tab (SBC FY2020–2025); 10-K RSU framework description | FY2025 | 4 (SBC quantum) / 1 (metrics/weights) | Partial — no proxy CD&A | None in pool; proxy is the only source for CD&A |
| Ownership (beneficial) | CIQ Public Company Profile (float 90.9%); FY2025 10-K Item 9B (sell plans) | Jul 1, 2026 / Jan 2026 | 3 | Partial — no beneficial-ownership table | No Form 4 or 13D/13G export in pool |
| Insider trades | FY2025 10-K Item 9B — 10b5-1 plans disclosed (Bezos: sell ≤15M shares; Jassy: sell ≤142K shares) | Nov–Dec 2025 filings | 4 (existence confirmed) / 2 (transaction-level history) | Partial — plan disclosures present; Form 4 history absent | None in pool |
| Related-party transactions | FY2025 10-K (no RPTs in notes; Item 13 by proxy reference); disqualifier-scan confirmed no material RPTs | FY2025 | 4 | Partial — formal Item 13 in missing proxy; filing-level search is clean | Three annual 10-Ks provide partial substitute |
| Auditor report | FY2025 10-K, E&Y report (pp. 34–35, 73); unqualified opinion, one CAM (tax positions $6.6B) | FY2025 | 5 | N | — |
| Secretarial / compliance report | N/A — US SEC regime; no secretarial audit equivalent required | — | N/A | N/A | N/A |
| AGM voting | NOT IN POOL — 2026 proxy would contain voting results; prior proxy voting not in pool | — | — | Y | None in pool |
| Capital-allocation history | FY2025/2024/2023 10-Ks; CIQ Cash Flow and Supplemental tabs (FY2020–2025); Q1 2026 10-Q | FY2020–Q1 2026 | 5 | N | — |
| Legal / regulatory cases | FY2025 10-K Note 7 — Commitments and Contingencies; red-flags-sweep | FY2025 | 5 | N (disclosed cases); Y (reserve amounts not disclosed for major items) | — |

---

## 5C. Data Freshness

| Source | Period | As-of Date | Age (months) | Stale? | Impact |
|---|---|---|---|---|---|
| FY2025 10-K (annual report) | FY ended Dec 31, 2025 | Filed Apr 9, 2026 | ~3 | No | Primary governance anchor |
| Q1 2026 10-Q | Q ended Mar 31, 2026 | Filed Apr 30, 2026 | ~2.5 | No | Most recent financials |
| Q1 2026 Earnings Call | Apr 29, 2026 | Apr 29, 2026 | ~2.5 | No | Most recent management commentary |
| DEF 14A (2026 proxy) | Not in pool | Expected May 2026 | Unknown | N/A — MISSING | Compensation, ownership, board independence details absent |
| CIQ Public Company Profile | As of Jul 1, 2026 | Jul 1, 2026 | 0 | No | Float, share price, key personnel |
| CIQ Financials workbook | Through LTM Mar 31, 2026 | Data as of Apr 2026 | ~3 | No | Capital structure, SBC, ratios |
| CIQ Estimates Report | Latest revision Jun 26, 2026 | ~Jul 3, 2026 | 0 | No | Guidance history, beat-miss |
| CIQ Takeover Defenses | As-of pull date ~Jul 1, 2026 | Jul 1, 2026 | 0 | No | Governance provisions |
| FY2024 10-K | FY ended Dec 31, 2024 | Filed Feb 6, 2025 | ~17 | No (supplementary) | FY2024 baseline |
| FY2023 10-K | FY ended Dec 31, 2023 | Filed Feb 1, 2024 | ~29 | No (historical) | Three-year track-record anchor |
| YipitData Cloud panel (external) | Mar 2026 | Published Apr 16, 2026 | ~3 | No | AWS run-rate enrichment only |

Source manifest CSV export: included as the table above. Formal CSV sidecar file not written by this agent (orchestrator owns file IO); marked "pending" for machine-readable output if required.

---

## 6. Sufficiency Verdict

**Verdict: Partial**

**Reason:** Three full annual 10-Ks (FY2023–FY2025), a 10-Q, five earnings transcripts, board composition, capital-allocation history, and governance-provision data are all present and fresh — but the 2026 DEF 14A (proxy) is absent, leaving the compensation discussion and analysis (CD&A), the formal beneficial-ownership table, AGM voting results, and committee-level governance disclosures inaccessible.

**Specialists that can run:**
- Management track record (01) — fully runnable; executive roster, tenure, promise-vs-delivery, and earnings track record all available
- Capital allocation (02) — fully runnable; five-year CFO/capex/debt/buyback/M&A history available in filings and CIQ
- Incentives and compensation (03) — partially runnable; SBC quantum and RSU vehicle confirmed, but metrics/weights/peer benchmarks in the missing proxy CD&A; cap applies
- Ownership and insider behavior (04) — partially runnable; Bezos/Jassy sell plans confirmed, float 90.9% confirmed, but no quantified beneficial-ownership table; cap applies
- Board and shareholder rights (05) — runnable with limitations; board composition and governance provisions available; committee independence detail in missing proxy
- Candor and disclosure quality (06) — fully runnable; five transcripts + three shareholder letters + guidance-vs-actuals data all present

**Hard disqualifier already flagged by `business-model/01_disqualifier-scan`?** No — all 8 disqualifiers clear. No verdict lock.

**Active partial-data caps:**
- Incentive alignment max 50 (no proxy CD&A)
- Shareholder friendliness max 60 (no quantified beneficial-ownership table / no Form 4 history)
- Overall usefulness max 70 (no proxy / compensation disclosure)

**Critical missing items:**
- 2026 DEF 14A (proxy statement) — contains CD&A, beneficial ownership table, director independence certifications, committee memberships, AGM voting results, and formal RPT disclosure (Item 13)
- Dedicated Form 4 / CIQ Insider Transactions export — needed for historical insider-buying and -selling pattern, not just most recent 10b5-1 plan disclosures

**Single highest-value missing document:** 2026 DEF 14A (proxy statement) — it would simultaneously lift the incentive-alignment cap, complete the ownership picture, confirm board independence, and provide AGM vote results.
