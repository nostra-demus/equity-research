# Solvency Data Triage — EMAR

**Company:** Emaar Properties PJSC (DFM: EMAAR) — Dubai/UAE master-planned real-estate developer (build-to-sell off-plan + a smaller recurring malls-and-hospitality annuity).
**Reporting standard:** IFRS. **Currency:** AED millions (dirham pegged to USD at ~3.6725). **Fiscal year:** ends 31 December.
**Pool status:** 20 workbooks → 57 tabs + 12 documents = 69 extracts; **0 extraction failures** in `_pool_extracts/manifest.json` (every tab `ok`, every PDF/RTF `ok`). No `fail` / `fallback-text` / `missing-dependency` / `gdrive-pointer` states — nothing counts as missing on extraction grounds (fix F03).

> Note on the "Last Modified" column: file timestamps are Google-Drive sync dates, **not** authoritative reporting dates (fix F23). Every "Period Covered" below is parsed from **inside** the document (period-end / "as of" / filing line), not from the mtime.

## 1. File Inventory

Every source file is listed, and every multi-tab workbook has each tab as its own row (reconciled to `_pool_extracts/manifest.md`: 57 tabs + 12 documents = 69).

| Filename | Type | Period Covered (from inside doc) | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| Emaar_Properties_Annual_Report_2025.pdf | Audited annual report (IFRS, EY) | FY2025, period-end Dec-31-2025 (filed 2026-02-12) | 2026-07-08 | **High** |
| Emaar_Properties_Annual_Report_2024.pdf | Audited annual report (IFRS, EY) | FY2024, period-end Dec-31-2024 | 2026-07-08 | **High** (prior yr) |
| Emaar_Properties_Annual_Report_2023.pdf | Audited annual report (IFRS) | FY2023, period-end Dec-31-2023 | 2026-07-08 | Medium (history) |
| Emaar_Properties_Earnings_Press_Release_Q1_2026.pdf | Quarterly results release | Q1 FY2026, Mar-31-2026 | 2026-07-09 | **High** |
| Emaar_Properties_Earnings_Press_Release_Q4_2025.pdf | Quarterly results release | Q4 FY2025, Dec-31-2025 | 2026-07-09 | Medium |
| Emaar_Properties_Earnings_Press_Release_Q3_2025.pdf | Quarterly results release | Q3 FY2025, Sep-30-2025 | 2026-07-09 | Medium |
| Emaar properties Q4'25_Earnings_Call_Summary.pdf | Earnings-call summary | Q4 FY2025 | 2026-07-09 | Medium |
| Emaar Properties Q3'25_Earnings_Call_Summary.pdf | Earnings-call summary | Q3 FY2025 | 2026-07-09 | Medium |
| Emaar…Financials_Annual.xls › Balance Sheet | CIQ financials tab | FY2021–FY2025 + LTM Mar-31-2026 | 2026-06-20 | **High** |
| Emaar…Financials_Annual.xls › Cash Flow | CIQ financials tab | FY2021–FY2025 + LTM | 2026-06-20 | **High** |
| Emaar…Financials_Annual.xls › Capital Structure Details | CIQ debt-by-instrument tab | FY2025 as-reported (Dec-31-2025) | 2026-06-20 | **High** |
| Emaar…Financials_Annual.xls › Capital Structure Summary | CIQ capital-structure tab | FY2021–FY2025 | 2026-06-20 | **High** |
| Emaar…Financials_Annual.xls › Historical Capitalization | CIQ debt/cap tab | FY2021–FY2025 | 2026-06-20 | **High** |
| Emaar…Financials_Annual.xls › Ratios | CIQ ratios tab (leverage/coverage) | FY2021–FY2025 + LTM | 2026-06-20 | **High** |
| Emaar…Financials_Annual.xls › Income Statement | CIQ financials tab | FY2021–FY2025 + LTM | 2026-06-20 | High (EBITDA/interest) |
| Emaar…Financials_Annual.xls › Key Stats | CIQ summary tab | FY2021–FY2025 | 2026-06-20 | Medium |
| Emaar…Financials_Annual.xls › Multiples | CIQ multiples tab | FY2021–FY2025 | 2026-06-20 | Low |
| Emaar…Financials_Annual.xls › Supplemental | CIQ supplemental tab | FY2021–FY2025 | 2026-06-20 | Medium |
| Emaar…Financials_Annual.xls › Industry Specific | CIQ RE-specific tab (cost of sales) | FY2021–FY2025 | 2026-06-20 | Medium |
| Emaar…Financials_Annual.xls › Pension OPEB | CIQ EOSB/OPEB tab | FY2021–FY2025 | 2026-06-20 | Medium |
| Emaar…Financials_Annual.xls › Segments | CIQ segment tab | FY2021–FY2025 | 2026-06-20 | Medium |
| Emaar…Financials_Quarterly.xls › Balance Sheet | CIQ financials tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | **High** |
| Emaar…Financials_Quarterly.xls › Cash Flow | CIQ financials tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | **High** |
| Emaar…Financials_Quarterly.xls › Capital Structure Details | CIQ debt-by-instrument tab | latest as-reported | 2026-06-20 | **High** |
| Emaar…Financials_Quarterly.xls › Capital Structure Summary | CIQ capital-structure tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | **High** |
| Emaar…Financials_Quarterly.xls › Historical Capitalization | CIQ debt/cap tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | **High** |
| Emaar…Financials_Quarterly.xls › Ratios | CIQ ratios tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | **High** |
| Emaar…Financials_Quarterly.xls › Income Statement | CIQ financials tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | High |
| Emaar…Financials_Quarterly.xls › Key Stats | CIQ summary tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | Medium |
| Emaar…Financials_Quarterly.xls › Multiples | CIQ multiples tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | Low |
| Emaar…Financials_Quarterly.xls › Supplemental | CIQ supplemental tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | Medium |
| Emaar…Financials_Quarterly.xls › Industry Specific | CIQ RE-specific tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | Medium |
| Emaar…Financials_Quarterly.xls › Pension OPEB | CIQ EOSB/OPEB tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | Medium |
| Emaar…Financials_Quarterly.xls › Segments | CIQ segment tab | quarters through Q1 Mar-31-2026 | 2026-06-20 | Medium |
| Company Comparable Analysis…xls › Credit Health Panel | CIQ credit/ratings tab (S&P rating) | as-of 2026-06-28 (fin. updated 2026-05-11) | 2026-06-28 | **High** |
| Company Comparable Analysis…xls › Financial Data | CIQ comps tab | as-of 2026-06-28 | 2026-06-28 | Medium |
| Company Comparable Analysis…xls › Trading Multiples | CIQ comps tab | as-of 2026-06-28 | 2026-06-28 | Low |
| Company Comparable Analysis…xls › Operating Statistics | CIQ comps tab | as-of 2026-06-28 | 2026-06-28 | Low |
| Company Comparable Analysis…xls › Business Description | CIQ comps tab | as-of 2026-06-28 | 2026-06-28 | Low |
| Company Comparable Analysis…xls › Implied Valuation | CIQ comps tab | as-of 2026-06-28 | 2026-06-28 | Low (valuation — n/a here) |
| Company Comparable Analysis…xls › Valuation Chart | CIQ comps tab | as-of 2026-06-28 | 2026-06-28 | Low |
| Company Comparable Analysis…xls › Disclaimer | CIQ boilerplate | n/a | 2026-06-28 | Low |
| Emaar…Investment Analysis Direct Investments.xls › Direct Investments | CIQ JV/associate holdings tab | snapshot 2026-06-28 | 2026-06-28 | Medium (JV/associate exposure) |
| Emaar…Key Developments.xls › Key Developments | CIQ events tab (issuance/M&A) | through Jun 2026 | 2026-06-28 | Medium |
| Emaar…Suppliers.xls › Suppliers | CIQ suppliers tab | snapshot 2026-06-28 | 2026-06-28 | Low |
| Emaar…Customers.xls › Customers | CIQ customers tab | snapshot 2026-06-28 | 2026-06-28 | Low |
| Emaar…Board Members.xls › Board Members | CIQ governance tab | snapshot 2026-06-28 | 2026-06-28 | Low |
| Emaar…Professionals.xls › Professionals | CIQ governance tab | snapshot 2026-06-28 | 2026-06-28 | Low |
| Emaar…Compensation Summary Compensation.xls › Summary Compensation | CIQ pay tab | snapshot 2026-06-28 | 2026-06-28 | Low |
| Emaar…Analyst Coverage.xls › Analyst Coverage | CIQ coverage tab | snapshot 2026-06-28 | 2026-06-28 | Low |
| Emaar…Events Calendar.xls › Events Calendar | CIQ calendar tab | forward | 2026-06-28 | Low |
| EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls › Consensus | CIQ estimates tab | forward (FY2026–FY2028) | 2026-06-20 | Low (solvency) |
| EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls › Recent Changes | CIQ estimates tab | forward | 2026-06-20 | Low |
| EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls › Guidance | CIQ estimates tab | forward | 2026-06-20 | Low |
| EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls › Multiples | CIQ estimates tab | forward | 2026-06-20 | Low |
| EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls › Surprise | CIQ estimates tab | FY2021–FY2025 | 2026-06-20 | Low |
| EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls › Trends | CIQ estimates tab | forward | 2026-06-20 | Low |
| EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls › Revisions | CIQ estimates tab | forward | 2026-06-20 | Low |
| 01_Consensus.xlsx › Consensus | CIQ estimates (dup of Estimates workbook) | forward | 2026-06-28 | Low |
| 02_Recent Changes.xlsx › Recent Changes | CIQ estimates (dup) | forward | 2026-06-28 | Low |
| 03_Guidance.xlsx › Guidance | CIQ estimates (dup) | forward | 2026-06-28 | Low |
| 04_Multiples.xlsx › Multiples | CIQ estimates (dup) | forward | 2026-06-28 | Low |
| 05_Surprise.xlsx › Surprise | CIQ estimates (dup) | FY2021–FY2025 | 2026-06-28 | Low |
| 06_Trends.xlsx › Trends | CIQ estimates (dup) | forward | 2026-06-28 | Low |
| 07_Revisions.xlsx › Revisions | CIQ estimates (dup) | forward | 2026-06-28 | Low |
| Emaar…Public Company Profile.rtf | Company profile (narrative) | snapshot 2026 | 2026-07-08 | Low |
| Emaar…Public Ownership Summary.rtf | Ownership summary | snapshot 2026-06-28 | 2026-06-28 | Low |
| Emaar…Private Ownership.rtf | Ownership detail | snapshot 2026-06-28 | 2026-06-28 | Low |
| Emaar…Strategic Alliances.rtf | Alliances narrative | snapshot 2026-06-28 | 2026-06-28 | Low |

Duplicate note: the seven `0N_*.xlsx` files are single-tab copies of the seven tabs already inside `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` (the extractor flags this in `manifest.json → conflicts`). Estimates data is not solvency-relevant, so the duplication has no effect here.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Emaar_Properties_Annual_Report_2025.pdf (EY-audited) | FY2025, period-end Dec-31-2025 | ~6 |
| Quarterly filing | Emaar_Properties_Earnings_Press_Release_Q1_2026.pdf + CIQ Financials_Quarterly | Q1 FY2026, Mar-31-2026 | ~3 |
| Debt / capital-structure export | Emaar…Financials_Annual.xls › Capital Structure Summary + Details (+ Quarterly) | FY2025 as-reported / Q1 FY2026 | ~6 / ~3 |
| Fixed-income / maturities export | Emaar…Financials_Annual.xls › Capital Structure Details (Principal × Maturity × Floating) | FY2025 (Dec-31-2025) | ~6 |
| Cash flow statement | Emaar…Financials_Annual.xls › Cash Flow (+ Quarterly) + FY2025 AR audited cash flow | FY2025 / LTM Mar-31-2026 | ~6 / ~3 |
| Covenant / credit-agreement disclosure | Emaar_Properties_Annual_Report_2025.pdf (financial-risk-management note — covenant-compliance statement) | FY2025 | ~6 (qualitative; numeric thresholds to confirm) |
| Credit rating report | Company Comparable Analysis…xls › Credit Health Panel (S&P Issuer Credit Rating **BBB+**) | as-of 2026-06-28 / updated 2026-05-11 | ~1 |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | **Y** | CIQ Balance Sheet to Q1 Mar-31-2026; FY2025 AR (audited) | Debt, cash, equity base |
| Debt note (amounts by type) | **Y** | CIQ Capital Structure Details (sukuk / bank loans / leases / revolver, per instrument); AR Note 24 (Interest-bearing loans and borrowings) + Note 25 (Sukuk) | The debt stack and seniority |
| Maturity schedule | **Y** | CIQ Capital Structure Details (Principal Due × Maturity: 2026/2027/2028/2029/2031); AR "Interest-bearing loans and borrowings maturity profile" note | The maturity wall and refinancing exposure |
| Cash flow statement | **Y** | CIQ Cash Flow (annual + quarterly, to LTM Mar-31-2026); FY2025 AR audited IFRS cash-flow statement | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | **Y (partial)** | AR liquidity-risk note references "available undrawn" facilities; revolver drawn only AED 3.7m (EIBOR+1.0%, 2030) | True liquidity beyond cash — confirm committed revolver SIZE in agent 03 |
| Interest expense detail | **Y** | CIQ (Cash Interest Paid AED 1,093m LTM; EBITDA/interest 52.1x); AR finance-cost note | Coverage ratios |
| Covenant disclosure | **Y (qualitative only)** | FY2025 AR: "the Group has complied with applicable financial covenants" (financial-risk note) | Headroom to a breach — numeric threshold + covenant-EBITDA definition NOT yet established (agent 04) |
| Lease detail (operating/finance) | **Y** | IFRS 16; AR Note 20 (Right-of-use assets AED 713m); lease liabilities AED 809m (current+LT); CIQ leases | Debt-like obligations |
| Pension / OPEB funded status | **Y** | AR Note 26 (employees' end-of-service benefits, EOSB, AED 198m — unfunded UAE provision, disclosed); CIQ Pension OPEB tab | Off-balance-sheet obligation |
| Commitments & contingencies note | **Y** | FY2025 AR contingent-liabilities / commitments disclosure | Guarantees, LCs, litigation, tax claims |
| Credit ratings | **Y** | S&P Issuer Credit Rating **BBB+** (CIQ Credit Health Panel) | Refinancing access and cost |
| EBITDA base (for stress test) | **Y** | CIQ standardized EBITDA AED 25,201m LTM Mar-31-2026 + 5-yr history; company-defined EBITDA reconciled in `earnings/01` | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | **Y** | **Operating real-estate developer** (build-to-sell ~80% + recurring mall/hospitality ~20%) — **NOT a bank/insurer** [business-model 02/99] | Selects the correct framework (module applies; see gate note in §6) |
| Revolver terms + availability / borrowing base | **Y (partial)** | Revolving Credit Line Facility EIBOR+1.0%, matures 2030, drawn AED 3.7m; not borrowing-base; availability via AR liquidity note | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | **N** | Not established from the pool (only a compliance statement) | Prevents "fake headroom" — agent 04 to use assumed covenants → cap |
| HoldCo / OpCo structure disclosure | **Y** | Consolidated group; Sukuk issued via financing SPV (trust certificates), parent-obligated; no material OpCo debt subordination flagged [FY2025 AR; business-model 11] | Structural subordination and upstreaming |
| Hedging / swaps disclosure | **Y** | AR market-risk note (p.216); floating debt only AED 1,070m of AED 10,615m (~90% fixed), so swap use is immaterial | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | **N (partial)** | Not confirmed in the pool | Hidden accelerants — agent 04 to scan AR debt notes / sukuk terms; if absent, state "Not disclosed in the data pool" |

## 4. Cross-Module Availability

Both upstream modules are fully complete (each has its `99_*-synthesis.md`). All six inputs this module reads are present.

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | **Y** |
| business-model/11_capital-allocation-governance.md | **Y** |
| business-model/03_segment-map.md | **Y** |
| earnings/01_historical-financials.md | **Y** |
| earnings/06_earnings-quality.md | **Y** |
| earnings/03_margin-drivers.md | **Y** |

Key carry-ins for downstream agents: (a) business-model classifies EMAR as a **cyclical** developer with 93% of revenue from one Dubai property cycle **at a peak** — so 01/06 must show leverage on both latest-year AND mid-cycle/normalised EBITDA, and 06 must add a cycle-calibrated EBITDA haircut. (b) earnings/06 confirms EBITDA is **cash-backed** (normalised CFO/EBITDA 91–159%; 94% LTM) — the coverage/leverage EBITDA is real. (c) business-model/11 confirms **net cash of ~AED 25bn (broad basis)**, debt falling every year, dividend ~2x covered — a §24 Filter-3 positive. (Valuation is intentionally NOT read — it runs concurrently.)

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United Arab Emirates | FY2025 AR; CIQ ticker DFM:EMAAR |
| Exchange | Dubai Financial Market (DFM: EMAAR) | CIQ Credit Health Panel; AR cover |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **Other — UAE** (SCA / DFM listing rules; not US SEC, not India SEBI) | FY2025 AR corporate-governance report |
| Reporting standard (US GAAP / IFRS / Ind AS) | **IFRS** | AR notes reference IFRS 15 / IFRS 16 and "International Financial Reporting Standards" |
| Reporting currency (USD / INR / …) | **AED** (UAE dirham, pegged to USD ~3.6725) | AR financial statements; CIQ "Currency: AED" |
| Document language(s) | **English** (all annual reports, press releases, call summaries, CIQ exports) | Extracts are English; per CLAUDE.md §27 language is not a gap regardless |

Downstream agents: apply UAE/IFRS Jurisdiction-Aware Sourcing — read the AR **Sukuk** note (Note 25), the interest-bearing loans note (Note 24), the maturity-profile and liquidity-risk notes, and the contingent-liabilities note; cite S&P **BBB+** (and any Moody's/Fitch if surfaced) as the ratings. Do NOT mark any US form "missing" — the UAE local equivalents are present.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | **N** — present (CIQ Cap-Structure Details by year + AR maturity-profile note) | 02, 06 | none |
| No covenant disclosure | **Partial (Y)** — compliance is stated, but numeric thresholds + covenant-EBITDA definition are NOT established | 04, 06 | Covenant headroom = "relies on assumed covenants" → **covenant headroom max 60**; flag addback-illusion; (usefulness-max-75 does NOT apply — a compliance statement IS disclosed) |
| No cash flow statement | **N** — present (CIQ + AR audited) | 03, 04, 06 | none |
| No undrawn-facility disclosure | **N** — AR liquidity note discloses undrawn facilities (confirm committed revolver size in 03) | 03 | none (watch-item) |
| No interest-expense detail | **N** — present (cash interest paid + coverage) | 04 | none |
| No EBITDA base | **N** — present (CIQ std EBITDA + 5-yr history) | 06 | none — stress test runs |

Additional module-specific watch-items (not verdict-changing): change-of-control / cross-default / rating-trigger clauses not yet confirmed (agent 04 to scan AR/sukuk terms; if absent → "Not disclosed in the data pool"); committed revolver facility size to confirm (agent 03).

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** A recent audited balance sheet, a full debt note by instrument and maturity, and a cash-flow statement are all present and current (FY2025 EY-audited IFRS annual report + CIQ data to Q1 FY2026 Mar-31-2026), so leverage, liquidity, coverage, the maturity wall, contingencies, and the survival stress test can all be built.
- **Business-type gate:** EMAR is an **operating real-estate developer**, not a bank/insurer — the debt/EBITDA / coverage / covenant framework **applies** (module runs). Two overlays for downstream: (i) a ~20% recurring malls-and-hospitality (REIT-like) segment — agent 04 should fold **maintenance capex** and lease-like fixed charges into coverage and avoid non-cash EBITDA add-backs; (ii) a **cyclical** developer at a peak Dubai cycle — agents 01/06 must show leverage on latest AND mid-cycle EBITDA and calibrate one stress haircut to the company's own trough-to-peak range.
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage/covenants, contingencies, stress test (all six).
- **Active partial-data caps:** covenant-headroom confidence only — numeric covenant thresholds and the covenant-EBITDA definition are not established from the pool (only a qualitative compliance statement). Agents 04/06 confirm from AR Notes 24–25 / sukuk terms; if not quantified, use assumed covenants and apply **covenant headroom max 60** with an addback-illusion flag. This caps ONE section, not the module — the headline stays Sufficient.
- **Critical missing items:** none that block the module. Watch-items for agents 03/04: (a) specific numeric covenant thresholds + covenant-EBITDA definition; (b) change-of-control / cross-default / rating-trigger clauses; (c) committed revolver facility size. Guidance notes for agent 01/03: CIQ net debt −24,969 is the **broad** basis (nets AED 22,503m short-term investments + 351m trading securities); the **strict** basis (§15) = total debt 10,064 − cash & equivalents 12,180 = **−2,116 (still net cash)** — 01 designates the canonical basis; and AED 43,339m **restricted cash** (off-plan escrow) must be excluded from usable liquidity by 03.
- **Single highest-value missing document:** the **sukuk offering circular / bank facility agreements** (financial-covenant definitions, covenant-EBITDA add-backs, and change-of-control / cross-default terms) — would convert covenant headroom from "assumed" to actual and lift the one cap.
