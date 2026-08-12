# Solvency Data Triage — HAIER

**Company:** Haier Smart Home Co., Ltd. — dual-primary-listed on the Shanghai Stock Exchange (A-shares, SHSE:600690) and the Hong Kong Stock Exchange (H-shares, SEHK:6690), plus a Frankfurt D-share line and a Level-1 US ADR program (Form F-6). Household appliances manufacturer — **not** a bank/insurer/REIT, so the Business Type Applicability Gate does not exclude this module.

`extract_pool.py` was re-run (`python3 .claude/tools/extract_pool.py "data/HAIER/" "analyses/HAIER_2026-08-13/_pool_extracts"`); it reported "fresh — 95 tabs across 31 workbook(s), 126 extract(s)". `manifest.json` lists 62 top-level sources, **all with `status: ok`** — no extraction failures, no `gdrive-pointer` stubs, no `fallback-text`/`missing-dependency` entries. No `ciq_facts.json` sidecar exists for this ticker, so all CIQ figures below are this agent's own sourced reads from the workbook extracts, not a mechanically-pinned sidecar value. No `data/HAIER/external/` folder exists, so Section 1A is omitted.

File "Last Modified" timestamps on disk are **all 2026-08-12/2026-08-13** (the Drive-sync date for this pool) — per CLAUDE.md §27/F23 this is NOT the document date. Every period below is parsed from inside each document (filing date, period-end, "as of" line printed by CIQ), not from filesystem mtime.

---

## 1. File Inventory

| Filename | Type / Tab | Period Covered (from inside doc) | Solvency Relevance |
|---|---|---|---|
| Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf | Annual filing (A-share, CAS, Simplified Chinese) | FY2025 (period ended 2025-12-31), filed 2026-03-26 | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf | Annual filing (H-share, IFRS-reconciled, Traditional Chinese) | FY2025 (period ended 2025-12-31), filed 2026-04-27 | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Preliminary_Annual_Report(Mar-26-2026).pdf | Preliminary full-year results announcement (HKEX, Traditional Chinese, financial summary in RMB millions) | FY2025 vs FY2024 | Medium (summary only, no notes) |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf | Quarterly filing — 2026 First Quarter Report (HKEX inside-information announcement, English + CAS basis) | Q1 2026 (ended 2026-03-31) | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Oct-30-2025).pdf | Quarterly filing — 2025 Third Quarter Report (HKEX, English + CAS basis) | Q3 2025 (ended 2025-09-30) | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Oct-31-2025).pdf | A-share exchange announcement — H1 2025 equity distribution implementation (Simplified Chinese) | Reference date 2025-10-31; H1 2025 dividend mechanics | Low |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Nov-28-2025).pdf | HKEX overseas regulatory announcement — Q3 2025 results briefing notice (Traditional + Simplified Chinese) | 2025-11-28 | Low |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(May-18-2026).pdf | HKEX overseas regulatory announcement — FY2025/Q1 2026 results briefing notice (Traditional + Simplified Chinese) | 2026-05-18 | Low |
| Haier_Smart_Home_Co_Ltd_-_(Oct-23-2025).pdf | A-share announcement — H1 2025 profit distribution ratio adjustment (Simplified Chinese) | 2025-10-23 | Low |
| Haier Smart Home Co., Ltd., Q2 2019 Earnings Call, Aug 30, 2019.pdf | Transcript (English) | Q2 2019 | Low (stale, no probative value for current solvency) |
| Haier Smart Home Co., Ltd., Q3 2019 Earnings Call, Oct 31, 2019.pdf | Transcript (English) | Q3 2019 | Low (stale) |
| Key Document Digest.pdf | SEC Form F-6 (ADR registration statement, English) | Filed 2021-11-19 | Low (ADR mechanics, not solvency) |
| HaierSmartHomeCoLtdSHSE600690_AllAccess.pdf | CIQ "All Access" bundle — ownership, research-report index, key developments (English) | Rolling, latest entries through Aug-2026 | Low/Medium (context only; no primary financial statements) |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — Financial Data | CIQ peer comps | Multi-year, USD | Medium |
| " " — Trading Multiples | CIQ peer comps | Current | Low |
| " " — Operating Statistics | CIQ peer comps | Current | Low |
| " " — Business Description | CIQ static | n/a | Low |
| " " — Implied Valuation | CIQ peer comps | Current | Low (valuation, not solvency) |
| " " — Valuation Chart | CIQ peer comps | Current | Low |
| " " — Credit Health Panel | CIQ peer comps (duplicate of standalone Credit Health Panel below) | LTM Mar-31-2026 | Medium |
| " " — Disclaimer | Boilerplate | n/a | Low |
| Haier Smart Home Co Ltd SHSE 600690 Analyst Coverage.rtf | Sell-side coverage list (English) | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Board Members.rtf | Governance (English) | Current | Low (governance, not solvency) |
| Haier Smart Home Co Ltd SHSE 600690 Committees.rtf | Governance (English) | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Comparable M A Transactions.xls — Comparable M&A Transactions | CIQ deal comps | Historical | Low |
| Haier Smart Home Co Ltd SHSE 600690 Compensation Summary Compensation.rtf | Governance (English) | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Competitors.rtf | Peer list (English) | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Corporate Timeline.rtf | Corporate history (English) | Historical | Low |
| Haier Smart Home Co Ltd SHSE 600690 Corporate Timeline.xls — Corporate Timeline | Corporate history | Historical | Low |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — Summary | CIQ relative credit-health scoring vs. 22 peers (Overall/Operational/Solvency/Liquidity quartile scores) | LTM ended 2026-03-31, financials updated 2026-04-28 | High |
| " " — Financials | CIQ credit-panel financial detail | LTM Mar-31-2026 | High |
| " " — Operational Metrics Charts | Chart headers only (no populated numeric grid in extract) | LTM Mar-31-2026 | Low |
| " " — Solvency Metrics Charts | Chart headers only (FFO interest coverage, Net Debt/EBITDA, Debt/Capital — chart-based, not tabular) | LTM Mar-31-2026 | Medium |
| " " — Liquidity Metrics Charts | Chart headers only (Current ratio, Quick ratio, Basic Defense Interval) | LTM Mar-31-2026 | Medium |
| " " — Disclaimer | Boilerplate | n/a | Low |
| Haier Smart Home Co Ltd SHSE 600690 Customers.xls — Customers | CIQ relationship data | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Equity Listings.xls / (1).xls — Equity Listings | Listing venues (A/H/D shares, ADR) | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Events Calendar.xls — Events Calendar | Corporate calendar | Forward-looking | Low |
| Haier Smart Home Co Ltd SHSE 600690 Financials.xls — Key Stats | CIQ financial summary | FY2021–FY2025 + LTM Mar-2026, CNY | Medium |
| " " — Income Statement | CIQ income statement (incl. Interest Expense line) | FY2021–FY2025 + LTM Mar-2026, CNY | High |
| " " — Balance Sheet | CIQ balance sheet | FY2021–FY2025 + Q1-2026 (2026-03-31), CNY | **High** |
| " " — Cash Flow | CIQ cash flow statement | FY2021–FY2025 + LTM Mar-2026, CNY | **High** |
| " " — Multiples | CIQ trading multiples | Current | Low |
| " " — Historical Capitalization | CIQ market-cap/share-count history | Multi-year | Low |
| " " — Capital Structure Summary | CIQ debt summary (Total Debt, Net Debt, secured/unsecured split, credit ratios incl. EBIT/EBITDA-to-Interest, Debt/EBITDA) | FY2024, FY2025, Q1-2026 (2026-03-31) | **High** |
| " " — Capital Structure Details | CIQ instrument-level debt-by-type-and-maturity ("as reported") | FY2025 (filed 2026-03-27) and FY2024 | **High** |
| " " — Ratios | CIQ ratio set | Multi-year | Medium |
| " " — Supplemental | CIQ supplemental line items | Multi-year | Low |
| " " — Industry Specific | CIQ sector metrics (appliance-specific) | Multi-year | Low |
| " " — Pension OPEB | CIQ pension/OPEB detail | Multi-year | Medium |
| " " — Segments | CIQ segment financials | Multi-year | Medium |
| Haier Smart Home Co Ltd SHSE 600690 Financials (1).xls — [same 13 tabs as above] | CIQ export, "Historical" FX conversion | Same periods as Financials.xls | Duplicate of Financials.xls (High for BS/CF/Capital Structure tabs) |
| Haier Smart Home Co Ltd SHSE 600690 Financials (2).xls — [same 13 tabs as above] | CIQ export, "Today's Spot Rate" FX conversion (differs from (1) only in currency-conversion setting) | Same periods | Duplicate — do not double-count as independent evidence |
| Haier Smart Home Co Ltd SHSE 600690 Financials Capital Structure Details.xls — Capital Structure Details | Standalone re-export of the same tab | FY2025/FY2024 | Duplicate of High-relevance tab above |
| Haier Smart Home Co Ltd SHSE 600690 Financials Capital Structure Summary.xls — Capital Structure Summary | Standalone re-export | FY2024/FY2025/Q1-2026 | Duplicate |
| Haier Smart Home Co Ltd SHSE 600690 Financials Segments.xls — Segments | Standalone re-export | Multi-year | Duplicate |
| Haier Smart Home Co Ltd SHSE 600690 Fixed Income Securities Summary.rtf | CIQ fixed-income securities list (issuer/seniority/coupon/maturity for public notes; "no Indentures or Credit Agreements available") | As of extraction | **High** |
| Haier Smart Home Co Ltd SHSE 600690 Fixed Income Summary.rtf | CIQ fixed-income/credit-ratios summary incl. maturity schedule, credit ratios *Mar-31-2026, "credit ratings not available (S&P/Moody's)" | Mar-31-2026 | **High** |
| Haier Smart Home Co Ltd SHSE 600690 Industry Classifications.rtf | Sector taxonomy | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Investment Analysis Co Investors.xls — Co-Investors | Ownership data | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Investment Analysis Direct Investments.xls — Direct Investments | M&A/investment data | Historical | Low |
| Haier Smart Home Co Ltd SHSE 600690 Investment Criteria Direct Investments.xls — Direct Investments | Investment criteria | n/a | Low |
| Haier Smart Home Co Ltd SHSE 600690 Key Developments.xls — Key Developments | Corporate news log | Rolling | Low/Medium (may flag rating/debt events) |
| Haier Smart Home Co Ltd SHSE 600690 LP Co Investors.xls — LP Co-Investors | Ownership data | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 LP Investments.xls — LP Investments | Investment data | Historical | Low |
| Haier Smart Home Co Ltd SHSE 600690 Long Business Description.rtf | Business description (English) | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 News.rtf | News stub | n/a | Low |
| Haier Smart Home Co Ltd SHSE 600690 Offices.rtf | Office list | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Portfolio Exposure.xls — Portfolio Exposure | Investment exposure | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Private Ownership.rtf | Ownership (English) | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Products.rtf | Product catalogue (English) | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Professionals.rtf | Management bios (English) | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Public Holdings Detailed.xls — Detailed | Institutional holdings | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Public Ownership Summary.rtf | Ownership summary | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Strategic Alliances.xls — Strategic Alliances | Partnerships | Historical | Low |
| Haier Smart Home Co Ltd SHSE 600690 Suppliers.xls — Suppliers | Supplier relationships | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.rtf | Governance (English) | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.xls — Corporate Governance / Takeover Defenses / Compare Defenses | Governance detail | Current | Low |
| Haier Smart Home Co Ltd SHSE 600690 Transaction Advisors.xls — Transaction Advisors | Deal advisor log | Historical | Low |
| Haier Smart Home Co Ltd SHSE 600690 海尔智家股份有限公司 Public Company Profile.rtf | Company profile (Simplified Chinese + English) | Current | Low |
| Haier Smart Home Co., Ltd. (SHSE_600690) Corporate Structure Tree.xls — [3 tabs: entity tree / Filtered Count / Aggregates] | Subsidiary/entity ownership tree (278 rows) | Current | Medium (informs HoldCo/OpCo mapping for `01`) |
| HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls — Consensus / Recent Changes / Guidance / Multiples / Surprise / Trends / Revisions (7 tabs) | Sell-side consensus estimates | Rolling, forward FY2026–FY2028 | Low (earnings-module input, not solvency) |
| HaierSmartHomeCo,LtdSHSE600690EstimatesReport (1).xls — [same 7 tabs] | Duplicate export | Same | Duplicate |
| HaierSmartHomeCo,LtdSHSE600690EstimatesReport (2).xls — Guidance | Duplicate/partial export | Same | Duplicate |
| Transaction Summary Public Offerings.xls — Public Offerings | Equity/debt issuance history | Historical | Low/Medium |

**Extraction status:** all 62 manifest sources are `status: ok`. No document in this pool is missing, corrupt, or OCR-failed — the non-English documents (Simplified Chinese A-share filings, Traditional Chinese H-share/HKEX filings) are all present at full source tier per CLAUDE.md §27 and are not data gaps.

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, from period-end to 2026-08-13) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf (A-share, CAS) | FY2025, period ended 2025-12-31, filed 2026-03-26 | ~7.5 |
| Annual filing (parallel H-share/IFRS-reconciled version) | Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf | FY2025, filed 2026-04-27 | ~7.5 (same period) |
| Quarterly filing | Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf (2026 Q1 Report) | Q1 2026, period ended 2026-03-31 | ~4.5 |
| Debt / capital-structure export | "...Financials.xls" — Capital Structure Details & Capital Structure Summary tabs | FY2025 (filed 2026-03-27) + Q1-2026 (2026-03-31) | ~4.5–7.5 |
| Fixed-income / maturities export | "...Fixed Income Summary.rtf" / "...Fixed Income Securities Summary.rtf" | Mar-31-2026 | ~4.5 |
| Cash flow statement | "...Financials.xls" — Cash Flow tab (CapIQ) | LTM ended 2026-03-31 | ~4.5 |
| Covenant / credit-agreement disclosure | **None in pool** — CIQ Fixed Income Summary states "There are no Indentures or Credit Agreements available for this company"; no covenant terminology ("契约") found in the FY2025 Annual Report notes | n/a | n/a |
| Credit rating report | **None in pool** — CIQ shows "The data is not available at this time" for S&P and "Your account does not have access" for Moody's; the FY2025 Annual Report's own "Credit rating adjustment" disclosure box is marked not-applicable | n/a | n/a |

---

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | CIQ "Financials.xls" Balance Sheet tab, through 2026-03-31; FY2025 Annual Report (A-share/CAS), Mar-26-2026, consolidated statement of financial position | Debt, cash, equity base |
| Debt note (amounts by type) | Y | CIQ "Financials.xls" Capital Structure Details tab (instrument-level: term loans, current portion, lease liabilities, MTNs, pledge/guaranteed loans) FY2025 & FY2024; FY2025 Annual Report Notes 七、25 (short-term borrowings), 七、35 (long-term borrowings), 七、36 (bonds payable) | The debt stack and seniority |
| Maturity schedule | Y (partial granularity) | CIQ Capital Structure Details (per-instrument maturity dates: most short-term items bucketed to "2026-12-31"; Medium-term Notes dated 2028-02-25 and 2028-06-17); CIQ Fixed Income Summary maturity schedule (public notes only, Jun-2028) | The maturity wall and refinancing exposure — note: short-term bank-loan maturities are bucketed to fiscal year-end rather than exact dates, so the within-12-month wall is coarse |
| Cash flow statement | Y | CIQ "Financials.xls" Cash Flow tab, FY2021–FY2025 + LTM Mar-2026; company-reported operating cash flow figures in FY2025 Annual Report p.12 | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | **N** | FY2025 Annual Report only states narratively that the company "has obtained bank credit facilities from multiple commercial banks to meet working-capital needs and capex" (流动风险 note) — no quantified total or undrawn amount; CIQ Capital Structure Details has no "Revolving Credit Facility" line | True liquidity beyond cash — cannot be quantified from this pool |
| Interest expense detail | Y | CIQ "Financials.xls" Income Statement tab — "Interest Expense" line, FY2021–FY2025 + LTM Mar-2026 (e.g., -2,404 CNYmn LTM Mar-2026) | Coverage ratios |
| Covenant disclosure | **N** | Not disclosed anywhere in the pool; CIQ Fixed Income Summary explicitly: "There are no Indentures or Credit Agreements available for this company" | Headroom to a breach — not assessable from this pool |
| Lease detail (operating/finance) | Y | FY2025 Annual Report Notes 七、19 (使用权资产/right-of-use assets, RMB 6,024.2mn) and 七、37 (租赁负债/lease liabilities, RMB 4,551.4mn); CIQ Capital Structure Details "Lease Liabilities" line (RMB 6,182.7mn FY2025) | Debt-like obligations |
| Pension / OPEB funded status | Y (limited) | FY2025 Annual Report — defined-benefit-plan remeasurement note (设定受益计划变动额) and post-employment-benefits accounting policy note; CIQ "Pension OPEB" tab | Off-balance-sheet obligation — China's basic pension is a defined-contribution state scheme; the disclosed defined-benefit item appears small relative to the balance sheet |
| Commitments & contingencies note | Y | FY2025 Annual Report — guarantee note (担保情况: total guarantees to subsidiaries RMB 721,348 thousand = ~6.1% of net assets at period-end; no material litigation/arbitration this year per "本年度公司无重大诉讼、仲裁事项") | Guarantees, LCs, litigation, tax claims |
| Credit ratings | **N** | CIQ: S&P "data not available"; Moody's "account does not have access"; FY2025 Annual Report's own rating-adjustment disclosure box marked not-applicable | Refinancing access and cost — not assessable |
| EBITDA base (for stress test) | Y | CIQ "Financials.xls" Key Stats/Income Statement tabs (FY2021–FY2025 EBITDA, EBITDA margin); reconciled in `earnings/01_historical-financials.md` (FY2025 EBITDA RMB 26,543.4mn; LTM Mar-2026 RMB 25,950.2mn) | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Household-appliance manufacturer confirmed across all sources (segment map, product RTFs, industry classification) — operating company, not a financial institution | Selects the correct framework — this module applies |
| Revolver terms + availability / borrowing base | **N** | No revolver instrument identified in CIQ Capital Structure Details; only term loans, MTNs, and finance leases are itemized | Determines usable liquidity and springing covenants — cannot be assessed |
| Covenant EBITDA definition (addbacks / caps) | **N** | No covenant package disclosed (see above) | Prevents "fake headroom" — not applicable since no covenant is disclosed to test |
| HoldCo / OpCo structure disclosure | Y (partial) | "Corporate Structure Tree.xls" (278-row subsidiary tree); Capital Structure Details shows all onshore debt is CNY-denominated at the listed parent level, but the Fixed Income Summary lists one perpetual preferred security issued by a UK subsidiary (Haier Smart Home UK & I Limited) — the entity map exists but `01` still needs to confirm where each instrument legally sits | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Y | FY2025 Annual Report — FX hedging note (远期外汇合约/forward FX contracts; 衍生金融工具/derivative financial instruments RMB 71.7mn at period-end; dedicated FX-risk and hedging-effectiveness sections) — no interest-rate swap specifically disclosed | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | **N** | No "交叉违约" (cross-default), "控制权变更" (change of control), or "加速到期" (acceleration) language found anywhere in the FY2025 Annual Report or the CIQ fixed-income exports | Hidden accelerants to distress — "Not disclosed in the data pool" per MODULE_RULES Structural Priority rule 3 |

---

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y — already carries EBITDA, net debt (strict basis), FCF, and Net Debt/EBITDA trend FY2021–FY2025 plus a TTM snapshot to Mar-31-2026 |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

All six cross-module files exist on disk under `analyses/HAIER_2026-08-13/business-model/` and `analyses/HAIER_2026-08-13/earnings/`. `earnings/01_historical-financials.md` already reconciles the CapIQ "broad" net-debt basis against a strict (CFO−ST investments-excluded) basis it computed itself — the balance-sheet-survival module's `01` agent should read that reconciliation before re-deriving net debt.

---

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | People's Republic of China | FY2025 Annual Report (A-share/CAS), Mar-26-2026, cover page (公司代码：600690 公司简称：海尔智家) |
| Exchange | Dual-primary listed: Shanghai Stock Exchange (A-shares, 600690) + Hong Kong Stock Exchange (H-shares, 6690); also a Frankfurt D-share line and a US Level-1 ADR (Form F-6, unlisted OTC) | FY2025 Annual Report (H-share), Apr-27-2026, cover; "Equity Listings" CIQ export; Key Document Digest.pdf (Form F-6) |
| Filing regime | Other — mainland China (CSRC / SSE self-regulatory rules) for the A-share filings, HKEX Listing Rules Rule 13.09(2)/13.10B for the H-share inside-information announcements | FY2025 Annual Report (A-share), Mar-26-2026; Q1 2026 Report (HKEX), Apr-27-2026 |
| Reporting standard | China Accounting Standards for Business Enterprises (CAS/ASBE) for the A-share filings; the H-share filings restate to IFRS but the company states net profit and equity attributable to owners "are not different" between the two bases | Q1 2026 Report (HKEX), Apr-27-2026, p.1: "prepared in accordance with the China Accounting Standards for Business Enterprises... are not different from those financial data prepared under the International Financial Reporting Standards" |
| Reporting currency | RMB (CNY); figures in the CIQ exports are in CNY millions; the company also files a full-year results summary in RMB million (人民幣百萬元) in the HKEX preliminary announcement | FY2025 Annual Report (A-share), Note; CIQ "Financials.xls" header ("Currency: Reported Currency... CNY"); Preliminary Annual Report (HKEX), Mar-26-2026 |
| Document language(s) | Simplified Chinese (A-share Annual Report and SSE announcements), Traditional Chinese + English (H-share/HKEX Annual Report, quarterly reports, and overseas-regulatory announcements — bilingual), English (CIQ workbooks, RTFs, 2019 transcripts, Form F-6) | Direct inspection of each extract's header language |

**Application:** downstream agents in this module read the A-share Annual Report's Notes to Accounts (七、25/35/36/19/37 for borrowings, bonds, ROU assets, and lease liabilities; 担保情况 for guarantees) as the primary debt/contingency source, not a US-style 10-K debt note or indenture — consistent with MODULE_RULES' Jurisdiction-Aware Sourcing rule. All figures are stated in RMB (CNY); do not silently convert to USD without stating the FX date/rate (CLAUDE.md §15). The non-English filings are full-tier Level-1/2 sources per §27 — none of the Chinese-language documents above are marked "missing" or discounted for language.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N (schedule exists but is coarse — ST items bucketed to fiscal year-end, not exact dates) | 02, 06 | No hard cap triggered; `02` should flag reduced within-year granularity and treat the ST bucket as a single wall rather than a month-by-month ladder |
| No covenant disclosure | **Y** | 04, 06 | Covenant headroom = "Not assessable"; Overall usefulness max 75 |
| No cash flow statement | N (present) | 03, 04, 06 | Not applicable |
| No undrawn-facility disclosure | **Y** | 03 | Liquidity = cash (+ ST investments) only; flag that it is understated versus true available credit |
| No interest-expense detail | N (present) | 04 | Not applicable |
| No EBITDA base | N (present) | 06 | Not applicable |

Additional caps from the module's Score Cap Rules table that this triage flags for `99`:
- **No credit ratings** (Rule: "Note the absence; do not infer a rating" — applies to `99`).
- **No revolver availability / borrowing-base detail** — no revolver was even identified as an instrument type in this pool, which is a stronger gap than "availability unknown"; `03`/`06` should treat all liquidity as cash-and-ST-investments-only and cap liquidity-runway confidence (MODULE_RULES: "Liquidity runway max 60").
- **No HoldCo/OpCo disclosure for the one identified foreign-sub instrument** (the UK subsidiary perpetual preferred) — immaterial in size but `01` should still state where it legally sits; this is not expected to cap Solvency strength given its evident small size relative to total debt (~CNY 42.7bn FY2025), but `01` must confirm materiality with its own read.
- **Off-balance-sheet exposures:** guarantees are disclosed and quantified (~6.1% of net assets) and no material litigation exists this year — this is NOT a case of "off-balance-sheet exposures undisclosed for a known-litigious/levered name," so that cap does not apply.

---

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent balance sheet (through 2026-03-31), an instrument-level debt note by type and (bucketed) maturity, and a cash flow statement (through LTM 2026-03-31) are all present and mutually consistent across the CIQ export and the company's own FY2025 Annual Report notes — leverage, liquidity, coverage, and a stress test can all be built.
- **Sections that can run:** capital structure and leverage (`01`); maturity wall and refinancing, at reduced within-year granularity (`02`); liquidity runway, cash-basis only (`03`); coverage (interest expense is disclosed) but covenant headroom is "Not assessable" (`04`); contingencies — guarantees are quantified, litigation is disclosed as immaterial this year (`05`); downside stress test, using the disclosed EBITDA base (`06`).
- **Active partial-data caps:**
  - Covenant headroom = "Not assessable"; Overall usefulness max 75 (no indenture/credit-agreement/covenant package in the pool)
  - Liquidity = cash (+ short-term investments) only; no committed/undrawn facility figure to add; liquidity-runway confidence capped (MODULE_RULES: max 60) because no revolver/borrowing-base instrument was even identified
  - Credit ratings: note the absence in `99`; do not infer a rating
  - Maturity wall: treat the 2026 fiscal-year-end bucket as the effective near-term wall rather than a precise month-by-month schedule
- **Critical missing items:**
  - No committed/undrawn bank facility amount (only narrative language that facilities exist)
  - No public covenant package (no indenture/credit agreement in the pool)
  - No international or domestic credit rating in the pool
  - No change-of-control / cross-default / rating-trigger disclosure found
- **Single highest-value missing document:** the company's bank credit-facility agreements (or a disclosure of total committed/undrawn credit-line capacity) — this single document would remove both the liquidity cap and the "no revolver" gap at once, since it is the one structural unknown behind an otherwise net-cash-adjacent, low-leverage balance sheet (FY2025 Total Debt/EBITDA ≈1.5x, Net Debt/EBITDA net-cash per CIQ Capital Structure Summary, as of 2026-03-31).
