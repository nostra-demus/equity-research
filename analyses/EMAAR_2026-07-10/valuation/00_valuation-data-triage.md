# Valuation Data Triage — EMAR

Company: **Emaar Properties PJSC** (DFM:EMAAR). Data pool: `data/EMAR/`. Extract pool: `analyses/EMAR_2026-07-10/_pool_extracts/` (fresh — 20 workbooks → 57 tabs, 69 extracts, **0 extraction failures**; all 32 source files `status: ok` in `manifest.json`). CIQ deterministic facts sidecar `ciq_facts.json` is present and pinned into the reads below.

Periods below are parsed from INSIDE each document (period-end / "as of" / filing-date lines), NOT the Drive-sync last-modified date (fix F23). All CIQ financial tabs are in **AED**; the Capital IQ comps workbook is converted to **USD** at spot (flag for `01`).

## 1. File Inventory

Multi-tab workbooks are expanded to one row per tab (reconciled to `_pool_extracts/manifest.md`); single-tab workbooks, PDFs and RTFs are one row each. No workbook is left as a single opaque row.

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| Emaar_Properties_Annual_Report_2025.pdf | Audited annual report (IFRS), English | FY2025 (period-end 31-Dec-2025; filed 12-Feb-2026) | 2026-07-08 (sync) | High |
| Emaar_Properties_Annual_Report_2024.pdf | Audited annual report (IFRS) | FY2024 (period-end 31-Dec-2024) | 2026-07-08 (sync) | High |
| Emaar_Properties_Annual_Report_2023.pdf | Audited annual report (IFRS) | FY2023 (period-end 31-Dec-2023) | 2026-07-08 (sync) | Medium (history) |
| Emaar_Properties_Earnings_Press_Release_Q1_2026.pdf | Quarterly results press release | Q1 2026 (period-end 31-Mar-2026) | 2026-07-09 (sync) | High |
| Emaar_Properties_Earnings_Press_Release_Q4_2025.pdf | Quarterly / FY results press release | Q4/FY 2025 (period-end 31-Dec-2025) | 2026-07-09 (sync) | Medium |
| Emaar_Properties_Earnings_Press_Release_Q3_2025.pdf | Quarterly results press release | Q3 2025 (period-end 30-Sep-2025) | 2026-07-09 (sync) | Medium |
| Emaar properties Q4'25_Earnings_Call_Summary.pdf | Earnings-call summary (transcript tier) | Q4/FY 2025 | 2026-07-09 (sync) | Medium |
| Emaar Properties Q3'25_Earnings_Call_Summary.pdf | Earnings-call summary (transcript tier) | Q3 2025 | 2026-07-09 (sync) | Medium |
| Financials_Annual.xls → **Income Statement** | CIQ annual financials tab (98×7, AED) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Balance Sheet** | CIQ annual financials tab (101×7, AED) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Cash Flow** | CIQ annual financials tab (77×7, AED) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Multiples** | CIQ annual multiples tab (91×9) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Capital Structure Summary** | CIQ annual tab (96×7, AED) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Capital Structure Details** | CIQ annual tab (44×10) — debt maturity/fixed-float | latest as-reported (31-Dec-2025) | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Historical Capitalization** | CIQ annual tab (39×7) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Segments** | CIQ annual segment tab (84×7, AED) — revenue/PBT/assets/D&A by segment + geography | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Ratios** | CIQ annual ratios tab (161×7) — ROIC etc. | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Key Stats** | CIQ annual tab (91×9) | FY2020–FY2025 | 2026-06-20 (sync) | Medium |
| Financials_Annual.xls → **Supplemental** | CIQ annual tab (38×7) | FY2020–FY2025 | 2026-06-20 (sync) | Low |
| Financials_Annual.xls → **Industry Specific** | CIQ annual tab (65×7) — real-estate KPIs | FY2020–FY2025 | 2026-06-20 (sync) | Medium |
| Financials_Annual.xls → **Pension OPEB** | CIQ annual tab (44×7) | FY2020–FY2025 | 2026-06-20 (sync) | Low |
| Financials_Quarterly.xls → **Income Statement** | CIQ quarterly tab (95×18, AED) | through Q1 (31-Mar-2026); LTM | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Balance Sheet** | CIQ quarterly tab (99×18, AED) | through 31-Mar-2026 | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Cash Flow** | CIQ quarterly tab (77×18, AED) | through 31-Mar-2026; LTM | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Multiples** | CIQ quarterly multiples tab (91×19) — 16-qtr EV/EBITDA history | through 31-Mar-2026 | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Capital Structure Summary** | CIQ quarterly tab (74×35, AED) | through 31-Mar-2026 | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Capital Structure Details** | CIQ quarterly tab (44×10) | latest as-reported | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Historical Capitalization** | CIQ quarterly tab (39×18) | through 31-Mar-2026 | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Segments** | CIQ quarterly segment tab (84×18, AED) | through 31-Mar-2026 | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Ratios** | CIQ quarterly ratios tab (161×18) | through 31-Mar-2026 | 2026-06-20 (sync) | Medium |
| Financials_Quarterly.xls → **Key Stats** | CIQ quarterly tab (91×7) | through 31-Mar-2026 | 2026-06-20 (sync) | Medium |
| Financials_Quarterly.xls → **Supplemental / Industry Specific / Pension OPEB** | CIQ quarterly tabs (26×18 / 65×18 / 30×18) | through 31-Mar-2026 | 2026-06-20 (sync) | Low–Medium |
| Company Comparable Analysis …PJSC.xls → **Financial Data** | CIQ comps tab (50×17, **USD**) — price, shares, market cap, net debt, EV, LTM/NTM IS | as-of 28-Jun-2026 | 2026-06-28 (sync) | High |
| Company Comparable Analysis …PJSC.xls → **Trading Multiples** | CIQ comps tab (50×9, USD) — TEV/EBITDA, P/E, P/TangBV (LTM + NTM) | as-of 28-Jun-2026 | 2026-06-28 (sync) | High |
| Company Comparable Analysis …PJSC.xls → **Implied Valuation** | CIQ comps tab (69×9) — implied value from peer multiples | as-of 28-Jun-2026 | 2026-06-28 (sync) | High |
| Company Comparable Analysis …PJSC.xls → **Operating Statistics** | CIQ comps tab (50×13) — growth/margins vs peers | as-of 28-Jun-2026 | 2026-06-28 (sync) | Medium |
| Company Comparable Analysis …PJSC.xls → **Credit Health Panel** | CIQ comps tab (48×10) — leverage/coverage vs peers | as-of 28-Jun-2026 | 2026-06-28 (sync) | Medium |
| Company Comparable Analysis …PJSC.xls → **Business Description** | CIQ comps tab (44×3) | as-of 28-Jun-2026 | 2026-06-28 (sync) | Low |
| Company Comparable Analysis …PJSC.xls → **Valuation Chart** | CIQ comps tab (32×2) | as-of 28-Jun-2026 | 2026-06-28 (sync) | Low |
| Company Comparable Analysis …PJSC.xls → **Disclaimer** | CIQ comps tab (26×1) | — | 2026-06-28 (sync) | Low |
| EstimatesReport.xls → **Consensus** | CIQ estimates tab (514×81, AED) — revenue/EPS/EBITDA/target price | as-of ~Jun-2026 | 2026-06-20 (sync) | High |
| EstimatesReport.xls → **Multiples** | CIQ estimates tab (25×7) — forward multiples | as-of ~Jun-2026 | 2026-06-20 (sync) | High |
| EstimatesReport.xls → **Trends** | CIQ estimates tab (305×15) — estimate trend | as-of ~Jun-2026 | 2026-06-20 (sync) | High |
| EstimatesReport.xls → **Revisions** | CIQ estimates tab (467×13) — up/down revisions | as-of ~Jun-2026 | 2026-06-20 (sync) | Medium |
| EstimatesReport.xls → **Surprise** | CIQ estimates tab (245×74) — beat/miss history | as-of ~Jun-2026 | 2026-06-20 (sync) | Medium |
| EstimatesReport.xls → **Recent Changes** | CIQ estimates tab (265×10) | as-of ~Jun-2026 | 2026-06-20 (sync) | Medium |
| EstimatesReport.xls → **Guidance** | CIQ estimates tab (42×3) | as-of ~Jun-2026 | 2026-06-20 (sync) | Medium |
| 01_Consensus.xlsx → Consensus | CIQ estimates split (517×81) — **duplicate** of EstimatesReport Consensus | as-of ~28-Jun-2026 | 2026-06-28 (sync) | High |
| 04_Multiples.xlsx → Multiples | CIQ forward-multiples split (26×7) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | High |
| 06_Trends.xlsx → Trends | CIQ estimates split (306×15) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | Medium |
| 07_Revisions.xlsx → Revisions | CIQ estimates split (476×13) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | Medium |
| 05_Surprise.xlsx → Surprise | CIQ estimates split (248×74) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | Medium |
| 03_Guidance.xlsx → Guidance | CIQ estimates split (42×3) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | Low |
| 02_Recent Changes.xlsx → Recent Changes | CIQ estimates split (266×10) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | Low |
| Emaar…Investment Analysis Direct Investments.xls → Direct Investments | CIQ tab (69×21) — equity-method / associate stakes | as-of 28-Jun-2026 | 2026-06-28 (sync) | Medium (EV bridge / SOTP) |
| Emaar…Key Developments.xls → Key Developments | CIQ events tab (49×7) — incl. May-2026 ICD→Dubai Holding block transfer | through Jun-2026 | 2026-06-28 (sync) | Medium |
| Emaar…Analyst Coverage.xls → Analyst Coverage | CIQ tab (34×6) — covering analysts | as-of 28-Jun-2026 | 2026-06-28 (sync) | Medium |
| Emaar…Public Ownership Summary.rtf | CIQ ownership summary (RTF) — float / holders | as-of ~May-2026 | 2026-06-28 (sync) | Medium (share count/float) |
| Emaar…Public Company Profile.rtf | CIQ company profile (RTF) | as-of ~Jul-2026 | 2026-07-08 (sync) | Medium |
| Emaar…Private Ownership.rtf | CIQ ownership (RTF) | as-of ~Jun-2026 | 2026-06-28 (sync) | Low |
| Emaar…Board Members.xls → Board Members | CIQ tab (29×25) | as-of Jun-2026 | 2026-06-28 (sync) | Low (governance) |
| Emaar…Professionals.xls → Professionals | CIQ tab (33×24) | as-of Jun-2026 | 2026-06-28 (sync) | Low (governance) |
| Emaar…Compensation Summary Compensation.xls → Summary Compensation | CIQ tab (27×18) | as-of Jun-2026 | 2026-06-28 (sync) | Low (governance) |
| Emaar…Customers.xls → Customers | CIQ tab (40×8) | as-of Jun-2026 | 2026-06-28 (sync) | Low |
| Emaar…Suppliers.xls → Suppliers | CIQ tab (46×8) | as-of Jun-2026 | 2026-06-28 (sync) | Low |
| Emaar…Strategic Alliances.rtf | CIQ tab (RTF) | as-of Jun-2026 | 2026-06-28 (sync) | Low |
| Emaar…Events Calendar.xls → Events Calendar | CIQ tab (23×3) | forward calendar | 2026-06-28 (sync) | Low |

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United Arab Emirates — Dubai Financial Market (DFM:EMAAR) | Comps workbook header "Emaar Properties PJSC (DFM:EMAAR)"; FY2025 Annual Report cover |
| Filing regime | UAE — SCA (Securities & Commodities Authority) / DFM disclosure; **not** US SEC | FY2025 Annual Report; DFM "Key Developments" exchange intimations |
| Reporting standard | **IFRS** (IAS 24 related-party election referenced) | FY2025 Annual Report, Notes; governance module Note 33 citation |
| Reporting currency (and scale) | **AED** (dirham); figures in AED millions / billions (peg 3.6725 AED/USD) | CIQ Segments/IS tabs "Currency AED"; AR "AED 49.6 Bn Revenue", "AED 25.6 Bn EBITDA" |
| Fiscal-year end | **31 December** | CIQ periods "Dec-31-2025"; AR "As of 31 December 2025" |
| Document language(s) | **English** (annual report, press releases, CIQ exports all English) | FY2025 Integrated Annual Report (English original) |

Downstream agents read and cite the local-equivalent documents (Annual Report, quarterly results press release, DFM intimations, shareholding disclosures). No US form is treated as "missing" — none applies (§27). The Capital IQ comps sheet is USD-converted at spot; the native financials, estimates and target price are in AED — `01` must reconcile currency (AED price ≈ USD 3.32 × 3.6725 ≈ **AED 12.19**) so every per-share/AED method stays consistent (§15 FX date/rate).

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | Emaar_Properties_Annual_Report_2025.pdf | FY2025 / 31-Dec-2025 | ~6 |
| Quarterly filing | Emaar_Properties_Earnings_Press_Release_Q1_2026.pdf + CIQ Financials_Quarterly | Q1 2026 / 31-Mar-2026 | ~3 |
| Capital structure / balance sheet | Financials_Quarterly.xls → Balance Sheet / Capital Structure Summary | 31-Mar-2026 | ~3 |
| Consensus / estimate export | EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls → Consensus (also 01_Consensus.xlsx) | as-of ~Jun-2026 | ~0.5 |
| Multiples export | 04_Multiples.xlsx / EstimatesReport → Multiples + CIQ Financials → Multiples | as-of ~28-Jun-2026 | ~0.4 |
| Peer / comps export | Company Comparable Analysis Emaar Properties PJSC.xls | as-of 28-Jun-2026 | ~0.4 |
| Current price (IBKR / Capital IQ) | Company Comparable Analysis → Financial Data (USD 3.32; native ≈ AED 12.19) | 28-Jun-2026 | ~0.4 |
| Cash flow statement | Financials_Quarterly → Cash Flow (LTM) / Financials_Annual → Cash Flow | 31-Mar-2026 / FY2025 | ~3 |
| Segment data | Financials_Annual → Segments + Financials_Quarterly → Segments + AR IFRS 8 note | FY2025 / 31-Mar-2026 | ~3–6 |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Comps → Financial Data: USD 3.32 as-of 28-Jun-2026 (native ≈ AED 12.19); `ciq_facts.current_price` | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | 8,838.8m — Comps → Financial Data (as-of 28-Jun-2026); AR FY2025; `ciq_facts.shares_outstanding_m` | Market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y (effectively nil) | LTIP is **cash-settled Phantom Shares** (no dilution); single share class; no convertibles noted — mgmt-gov 03/04; AR FY2025 | Fully diluted ≈ basic — per-share fair value unaffected |
| Business type track | Y | **Real estate developer (Operating + real-estate/NAV overlay)**; multi-segment + listed subsidiary — see note below | Determines valid methods (EV/EBITDA, P/E, FCFF DCF primary; NAV + SOTP cross-checks) |
| Total debt, cash, minority/preferred | Y | Total debt AED 10,064.4m; net cash −24,969.2m (CIQ vendor basis); minority ≈ AED 3,759m; preferred none — CIQ Balance Sheet / Capital Structure (31-Mar-2026) | Enterprise-value bridge |
| Income statement (LTM or FY) | Y | CIQ Annual + Quarterly Income Statement; LTM to 31-Mar-2026 (EBITDA 25,200.7m) | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | CIQ Annual + Quarterly Cash Flow; CFO LTM 31,973m; `ciq_facts.ltm_ocf_m` | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | EstimatesReport → Consensus; target price mean AED 17.07; NTM EBITDA in comps; **LT growth consensus −14.8%** | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | CIQ Financials → Multiples (16-qtr EV/EBITDA; current 4.0x = 0th percentile of range 5.1–8.4x) | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis — 10 peers + subject (TEV/EBITDA 3.6x vs peer median 14.3x; UAE peer Aldar 8.3x) | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y | CIQ Segments: FY2025 revenue Real Estate 39,550 (80%) / Leasing-Retail 7,681 (15%) / Hospitality 2,326 (5%); segment PBT & assets & D&A also given | Sum-of-the-parts |
| Dividend / buyback data | Y | Dividend AED 1.00/share FY2023–25 (~AED 8.84bn) — AR FY2025; mgmt-gov synthesis | Shareholder-yield read |

**Business-type note.** Emaar is a build-and-sell **real estate developer** (Real Estate ~80% of revenue and ~75% of segment pre-tax profit) with a recurring rent-collecting **Leasing/Retail (malls)** segment (~15% rev / ~20% PBT), a small **Hospitality** segment (~5%), and a separately **listed development subsidiary (Emaar Development PJSC)**; the company discloses a third-party **NAV of ~AED 247bn**. This is treated as **Operating with a real-estate/NAV overlay** (not a pure REIT): EV/EBITDA, P/E and FCFF DCF are the primary methods, with NAV and SOTP as the real-estate/holding-company cross-checks. Method-map ambiguity is stated per MODULE_RULES Business-Type Method Map.

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y |
| business-model/08_competitive-map.md | Y |
| business-model/07_business-quality.md | Y |
| business-model/09_moat.md | Y |
| business-model/10_external-dependency.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/04_guidance-consensus.md | Y |
| earnings/03_margin-drivers.md | Y |
| earnings/07_earnings-sensitivity.md | Y |
| earnings/06_earnings-quality.md | Y |

Also present (drives the value-trap read): **management-governance/04_ownership-and-insider-behavior.md** and **99_management-governance-synthesis.md** — both fire **RF-OWN-004** (Government of Dubai / Dubai Holding controls 29.73%; founder-MD chairs a competing developer; IAS 24 election leaves the largest related-party channel unquantified). The governance module has explicitly handed a **value-trap note to valuation**: EV/EBITDA ~4.0x at the 0th percentile of its own 16-quarter range is not, on its own, a margin of safety under a government controller. balance-sheet-survival/ (all 8 files) is also present.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N | 01, 05, 07, 99 | Not triggered — price is pool-verified (Capital IQ Comps, 28-Jun-2026) |
| No consensus / forward estimates | N | 02, 03, 04, 05 | Not triggered — CIQ Consensus + NTM estimates present |
| No peer data | N | 03, 06 | Not triggered — 10-name comp set present |
| No segment-level data | N | 06 | Not triggered — segment revenue/PBT/assets present |
| No balance sheet / capital structure | N | 01, 04, 06 | Not triggered — full balance sheet + capital-structure tabs present |
| No cash flow statement | N | 04 | Not triggered — annual + quarterly cash flow present |

**No partial-data cap is triggered.** One score cap from OUTSIDE this table WILL bind, carried from management-governance: **RF-OWN-004 (structurally misaligned controlling owner, §24 Filter 6)** → per MODULE_RULES Score-Cap rules, **valuation attractiveness max 60**, **value-trap flag mandatory**, and the verdict may be **no better than "Modestly undervalued" on a cheap multiple alone**. Agents 03, 07 and 99 must apply it.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | CIQ Financials → Multiples, 16-qtr EV/EBITDA history; current 4.0x = 0th percentile (5.1–8.4x, median 6.5x) |
| Peer relative valuation | Y | None | 10 peers; peer median TEV/EBITDA 14.3x is skewed by distressed Chinese developers (Longfor 128.8x) — anchor on UAE/GCC peers (Aldar 8.3x, Arabian Centres 18.9x) and reconcile |
| Intrinsic DCF (Operating FCFF) | Y | None | IS + CF + BS + consensus near-term path all present. **Cyclicality gate:** developer with a land-sale cycle; consensus LT growth −14.8% and FY2025 EBITDA at a record — normalize; do not terminal on peak margins |
| Reverse DCF | Y | None | Pool-verified price present → "what's priced in" is solvable; inverts `04`'s model (WACC + normalized FCF base) |
| SOTP | Y | None | Multi-segment (Real Estate / Leasing-Retail / Hospitality) with segment revenue, PBT, assets, D&A; listed subsidiary (Emaar Development) + Direct Investments tab for equity-method stakes; leasing/malls valued NAV/cap-rate — name comparables (Aldar; Arabian Centres for malls) |

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** A usable IFRS earnings/cash-flow base (income statement AND cash flow, annual + LTM), a full balance sheet / capital structure (net cash), forward consensus estimates, a 10-name peer comp set, own-history multiples, and a pool-verified current price are all present — every one of the five valuation methods can run.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic FCFF DCF, reverse-DCF, and SOTP (all five).
- **Active partial-data caps:** none (no partial-data condition is triggered). Note separately: the **RF-OWN-004 owner-misalignment score cap** (valuation attractiveness max 60; mandatory value-trap flag; verdict no better than "Modestly undervalued" on a cheap multiple alone) will bind, carried from management-governance — it is a §24 Filter-6 cap, not a missing-data cap.
- **Critical missing items:** none material. Minor items for downstream agents: (1) the pool price is USD-converted (Capital IQ spot) — `01` must reconcile to AED-native at the 3.6725 peg (≈ AED 12.19) so all AED/per-share methods tie out; (2) CIQ estimates are duplicated across `EstimatesReport.xls` and the split `0x_*.xlsx` files — use one copy, do not double-count; (3) the CIQ "ownership" export is absent (`ciq_facts` insider/institutional-holder fields `missing`) — not required for valuation, and float/holder data is covered by the RTF ownership summaries and the FY2025 AR.
