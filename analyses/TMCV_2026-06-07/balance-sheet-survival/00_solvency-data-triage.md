# Solvency Data Triage — TMCV

**Company:** Tata Motors Limited (formerly TML Commercial Vehicles Limited), NSEI: TMCV
**Date:** 2026-06-07
**Reporting regime:** India / SEBI-LODR. Reporting standard: Ind AS. Currency: INR (₹ crores). Fiscal year ends March 31.

---

## 1. File Inventory

The pool extractor ran with `--force` and produced 12 tab extracts from the one successfully parsed workbook (Financials.xls). Five other workbooks failed with an OS resource-deadlock error (OLE2/BIFF locking on macOS). One PDF (Annual Report Jun-06-2026) is the primary solvency filing. The screenshot is a Capital IQ Credit Health Panel (useful for cross-check). Each tab and file is listed separately below.

| Filename / Tab | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| **Tata_Motors_Passenger_Vehicles_Limited_-_Form_Annual_Report(Jun-06-2026).pdf** | Integrated Annual Report (Ind AS audited) — includes Board's Report, MD&A, CG Report, Consolidated & Standalone Financials, Borrowings note, Maturity schedule, Covenant disclosure, Rating info | FY26 (year ended Mar 31, 2026) | 2026-06-07 | **High** |
| **Tata_Motors_Limited_-_Form_Preliminary_Interim_Report(May-13-2026).pdf** | SEBI LODR Reg 33 — Consolidated Audited Financial Results for Q4 and year ended Mar 31, 2026 (P&L, Balance Sheet, Cash Flow Statement) | FY26 annual + Q4 FY26 | 2026-06-07 | **High** |
| **Tata_Motors_Passenger_Vehicles_Limited_-_Form_Annual_Report(May-23-2025).pdf** | Integrated Annual Report (Ind AS) — prior year annual filing | FY25 (9-month period, Jun 23, 2024 to Mar 31, 2025) | 2026-06-07 | **Medium** |
| **Tata_Motors_Passenger_Vehicles_Limited_-_Form_Preliminary_Interim_Report(Jan-29-2026).pdf** | SEBI LODR quarterly results | Q3 FY26 (quarter ended Dec 31, 2025) | 2026-06-07 | **Medium** |
| **Tata_Motors_Passenger_Vehicles_Limited_-_Form_Preliminary_Interim_Report(Nov-07-2025).pdf** | SEBI LODR quarterly results | Q2 FY26 (quarter ended Sep 30, 2025) | 2026-06-07 | **Medium** |
| **Tata_Motors_Passenger_Vehicles_Limited_-_Form_Preliminary_Interim_Report(May-10-2024).pdf** | SEBI LODR quarterly results | Q4 FY24 (quarter ended Mar 31, 2024; pre-demerger entity) | 2026-06-07 | **Low** |
| **NSEI TMCV Financials.xls — Tab: Balance Sheet** (79×6) | Capital IQ annual balance sheet export | FY25–FY26 (annual) | 2026-06-07 | **High** |
| **NSEI TMCV Financials.xls — Tab: Cash Flow** (73×6) | Capital IQ annual cash flow export | FY25–FY26 (annual) | 2026-06-07 | **High** |
| **NSEI TMCV Financials.xls — Tab: Income Statement** (102×6) | Capital IQ annual income statement export | FY25–FY26 (annual) | 2026-06-07 | **High** |
| **NSEI TMCV Financials.xls — Tab: Key Stats** (90×6) | Capital IQ key financials + estimates; contains EV bridge, current market cap, total debt, net debt | FY25–FY26 + FY27–FY29E estimates | 2026-06-07 | **High** |
| **NSEI TMCV Financials.xls — Tab: Ratios** (161×6) | Capital IQ financial ratios — debt/equity, debt/EBITDA, coverage ratios, current ratio | FY25–FY26 (annual) | 2026-06-07 | **High** |
| **NSEI TMCV Financials.xls — Tab: Historical Capitalization** (17×6) | Capital IQ historical capitalization table | No data available | 2026-06-07 | **Low** |
| **NSEI TMCV Financials.xls — Tab: Capital Structure Summary** (13×6) | Capital IQ capital structure summary by instrument | No data available | 2026-06-07 | **Low** |
| **NSEI TMCV Financials.xls — Tab: Multiples** (91×6) | Capital IQ valuation multiples | FY25–FY26 | 2026-06-07 | **Low** |
| **NSEI TMCV Financials.xls — Tab: Supplemental** (24×6) | Capital IQ supplemental items (SBC, fair value) | FY25–FY26 | 2026-06-07 | **Low** |
| **NSEI TMCV Financials.xls — Tab: Pension OPEB** (15×6) | Capital IQ pension/OPEB data | No data available | 2026-06-07 | **Low** |
| **NSEI TMCV Financials.xls — Tab: Industry Specific** (15×6) | Capital IQ industry-specific data | FY25–FY26 | 2026-06-07 | **Low** |
| **NSEI TMCV Financials.xls — Tab: Segments** (40×6) | Capital IQ segment data | FY25–FY26 | 2026-06-07 | **Medium** |
| **Screenshot 2026-06-07 at 11.13.44 AM.png** | Capital IQ Credit Health Panel screenshot — scores (Overall: Below Average; Operational: Top; Inventory: Above Average; Liquidity: Bottom); peer comparison table with leverage, coverage, liquidity ratios for Indian CV peers | As of Mar 31, 2026 | 2026-06-07 | **Medium** |
| **Transcript Digest.pdf** | FQ4 FY26 earnings call transcript (May 13, 2026) — management commentary on FCF, net cash, debt repayment, EBITDA margins, Iveco acquisition, working capital | Q4 & FY26 earnings call | 2026-06-07 | **Medium** |
| **Transcript Digest (1).pdf** | Second transcript digest PDF (same call content, alternate format) | Q4 & FY26 earnings call | 2026-06-07 | **Low** |
| **NSEI TMCV Analyst Coverage.xls** | Capital IQ analyst coverage | FY26 | 2026-06-07 | **Low** (workbook failed to extract — OSError) |
| **NSEI TMCV Credit Health Panel.xls** | Capital IQ Credit Health Panel export | FY26 | 2026-06-07 | **Medium** (workbook failed to extract — OSError; data partially available via screenshot) |
| **NSEI TMCV Events Calendar.xls** | Capital IQ events calendar | FY26 | 2026-06-07 | **Low** (workbook failed to extract) |
| **NSEI TMCV Public Holdings Detailed.xls** | Capital IQ public holdings detail | FY26 | 2026-06-07 | **Low** (workbook failed to extract) |
| **Company Comparable Analysis Tata Motors Limited.xls** | Capital IQ peer comparable analysis | FY26 | 2026-06-07 | **Low** (workbook failed to extract) |
| **TataMotorsLimitedNSEITMCVEstimatesReport.xls** | Capital IQ estimates report | FY26–FY27E | 2026-06-07 | **Low** (workbook failed to extract) |
| **Tata Motors.xlsx** | User workbook (failed — BadZipFile; likely corrupted) | Unknown | 2026-06-07 | **Low** (failed to extract) |
| **NSEI TMCV Professionals.rtf** | Capital IQ executive/director profiles | Current | 2026-06-07 | **Low** |
| **NSEI TMCV Public Ownership Summary.rtf** | Capital IQ public ownership summary RTF | FY26 | 2026-06-07 | **Low** |

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Tata_Motors_Passenger_Vehicles_Limited_-_Form_Annual_Report(Jun-06-2026).pdf | FY26 year ended Mar 31, 2026; filed Jun 6, 2026 | ~0 months |
| Quarterly filing | Tata_Motors_Limited_-_Form_Preliminary_Interim_Report(May-13-2026).pdf | Q4 & year ended Mar 31, 2026; filed May 13, 2026 | ~1 month |
| Debt / capital-structure export | NSEI TMCV Financials.xls — Balance Sheet tab (Capital IQ) | FY26 annual (Mar 31, 2026) | ~0 months |
| Fixed-income / maturities export | FY26 Annual Report, MD&A — Maturity Profile table | As of Mar 31, 2026 | ~0 months |
| Cash flow statement | Preliminary Interim Report (May-13-2026) + Cash Flow tab (Capital IQ) | FY26 annual | ~0–1 months |
| Covenant / credit-agreement disclosure | FY26 Annual Report, MD&A — Loan Covenants section (pp.220–221) | As of Mar 31, 2026 | ~0 months |
| Credit rating report | FY26 Annual Report, Board's Report — Finance & Credit Rating section (pp.117–118); CRISIL, ICRA, CARE (AA+ Stable), S&P (BBB Stable) disclosed | Mar–May 2026 | ~0–3 months |

---

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | **Y** | Consolidated audited Balance Sheet as at Mar 31, 2026 — Preliminary Interim Report (May-13-2026); cross-checked against Capital IQ Balance Sheet tab. Total borrowings ₹4,817 cr; total equity ₹12,734 cr; total assets ₹52,309 cr. | Debt, cash, equity base |
| Debt note (amounts by type) | **Partial** | MD&A table in Annual Report (Jun-06-2026) shows short-term debt ₹678 cr, current portion of long-term debt ₹2,795 cr, long-term debt ₹1,344 cr, total ₹4,817 cr. NCDs aggregating ₹2,300 cr are noted. Breakdown by individual instrument (coupon, security, seniority per NCD) is referenced to the CG Report but the full debenture schedule is inside the annual report PDF. Balance Sheet shows lease liabilities (current ₹195 cr + non-current ₹603 cr = ₹798 cr). Capital IQ Capital Structure Summary tab returned "No Data Available." | The debt stack and seniority |
| Maturity schedule | **Y** | Annual Report (Jun-06-2026), MD&A p.220 — explicit maturity profile: within 1 yr ₹3,657 cr; 1–2 yr ₹1,357 cr; 2–5 yr ₹11 cr; above 5 yr ₹243 cr; total ₹5,269 cr (including accrued interest on current maturities). Also: USD 127 mn 5.875% Senior Notes matured and repaid in May 2025. | The maturity wall and refinancing exposure |
| Cash flow statement | **Y** | Preliminary Interim Report (May-13-2026), p.3 — full consolidated cash flow statement; CFO ₹14,981 cr, capex ₹2,248 cr, financing outflow ₹5,223 cr (including debt repayment). Interest paid ₹884 cr disclosed as a supplemental item. Capital IQ Cash Flow tab confirms figures. | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | **Y** | Annual Report (Jun-06-2026), MD&A p.220: fund-based working capital limit ₹4,000 cr of which ₹3,750 cr unutilized; non-fund-based limit ₹4,500 cr. Both are secured by hypothecation of current assets. Iveco acquisition: committed loan facility of EUR 3.8 bn arranged at TMLCVB (Netherlands subsidiary), backed by ₹1.9 bn corporate guarantee + ₹1.9 bn letter of comfort from TML, with a 12-month availability period and 1-year post-drawdown tenor. This Iveco facility has NOT yet been drawn as of Mar 31, 2026. | True liquidity beyond cash |
| Interest expense detail | **Y** | P&L shows finance costs ₹874 cr for FY26. Cash flow supplemental shows interest paid ₹884 cr. Annual Report MD&A confirms reduction from ₹1,079 cr (FY25 9M) to ₹874 cr. Coverage ratios are calculable. Capital IQ Ratios tab: EBIT/Interest = 9.18x; EBITDA/Interest = 11.40x; (EBITDA-capex)/Interest = 9.89x. | Coverage ratios |
| Covenant disclosure | **Partial** | Annual Report (Jun-06-2026), MD&A Loan Covenants section (pp.220–221): states that certain financing arrangements include financial covenants to "maintain certain net-worth, liability and debt related ratios." Management states compliance with all covenants as of FY26. Company monitors compliance on an ongoing basis. However, the actual covenant thresholds (specific net-worth floor, leverage cap, coverage floor) are NOT disclosed in the data pool — they are described qualitatively only. | Headroom to a breach |
| Lease detail (operating/finance) | **Partial** | Balance sheet shows lease liabilities: non-current ₹603 cr, current ₹195 cr, total ₹798 cr. Right-of-use assets ₹812 cr. Cash flow shows lease charges ₹65 cr and amortisation of ROU assets embedded in D&A. No separate schedule of operating vs finance lease split or individual maturity breakdown is available in the extracted text. Under Ind AS 116 (IFRS 16-equivalent), all significant leases are capitalized. | Debt-like obligations |
| Pension / OPEB funded status | **N** | Capital IQ Pension/OPEB tab: "No Data Available." Annual Report does not surface a defined benefit pension obligation in the extracted sections. TMCV is a commercial vehicle manufacturer with a workforce in India; gratuity and provident fund provisions are standard under Indian law but their funded status and any defined-benefit shortfall are not extractable from the available data pool. | Off-balance-sheet obligation |
| Commitments & contingencies note | **Partial** | Annual Report (Jun-06-2026): (1) Extended Producer Responsibility (EPR) obligations for end-of-life vehicles (effective Apr 1, 2025) — cost cannot be reliably estimated, no provision made; (2) Stamp duty ₹962 cr on demerger land transfers recognized as exceptional items; (3) Lease liabilities ₹798 cr; (4) Iveco corporate guarantee EUR 1.9 bn + letter of comfort EUR 1.9 bn given by TML. Full contingencies note (disputed tax, litigation, guarantees by amount) is referenced in the Annual Report but the specific contingent-liability amounts table is not separately confirmed in the extracted text — it exists in the filing but was not surfaced in the extracted pages reviewed. | Guarantees, LCs, litigation, tax claims |
| Credit ratings | **Y** | Annual Report (Jun-06-2026), Board's Report / Finance & Credit Rating (p.117–118): CRISIL AA+ Stable, ICRA AA+ Stable, CARE AA+ Stable (all three leading India agencies); S&P BBB Stable (investment grade, covers TML CV Holdings Pte. and TML CV Holdings B.V. in Singapore/Netherlands). Rating agencies noted the company's stronger business risk profile, solid financial risk profile, and robust FCF. S&P explicitly noted the proposed Iveco acquisition could be "neutral" for the credit rating. | Refinancing access and cost |
| EBITDA base (for stress test) | **Y** | Underlying EBITDA ₹10,314 cr (12.3% margin) for FY26 per MD&A. Capital IQ reports EBITDA ₹9,965 cr (slightly different — includes items that management excludes). Both measures available; stress test can be built on either. Earnings module (01_historical-financials.md) confirms the EBITDA base and its derivation. | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | **Y** | TMCV is an operating company — India's largest commercial vehicle manufacturer. Not a bank, insurer, or REIT. However, a HoldCo/OpCo element exists: TML CV Holdings Pte. Ltd. (Singapore) and TML CV Holdings B.V. (Netherlands) are holding entities that have arranged the EUR 3.8 bn Iveco acquisition facility at the subsidiary level, backed by a corporate guarantee and letter of comfort from the parent TML. The Iveco deal (if completed) introduces structural subordination considerations. Pre-Iveco, this is a straightforward operating company. | Selects the correct framework |
| Revolver terms + availability / borrowing base | **Y** | Fund-based working capital limits: ₹4,000 cr (consortium of banks), ₹3,750 cr unutilized as of Mar 31, 2026. Secured by hypothecation of entire current assets (inventory, receivables, book debts). Renewed annually. Non-fund-based (LCs, guarantees): ₹4,500 cr. No borrowing-base formula is disclosed — the facility appears to be a standard working capital line, not a borrowing-base revolver. | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | **N** | Annual Report (Jun-06-2026) Loan Covenants section states only that financial covenants include "net-worth, liability and debt related ratios" — no EBITDA-based covenant is explicitly named, no addback definition is disclosed, and no specific threshold or headroom figure is provided. It is not determinable whether any covenant uses a management-adjusted EBITDA definition. | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | **Partial** | Annual Report confirms TML CV Holdings Pte. Ltd. (Singapore, 100% subsidiary) and TML CV Holdings B.V. (Netherlands, step-down) are the acquisition vehicles for Iveco. The EUR 3.8 bn committed loan is arranged at TMLCVB and backed by a corporate guarantee (EUR 1.9 bn) and letter of comfort (EUR 1.9 bn) from TML. TMF Holdings Limited (TMFHL) is a wholly-owned subsidiary being merged into TML (scheme ongoing). Material structural subordination from these entities is pre-Iveco limited; post-Iveco closure it becomes significant. | Structural subordination and upstreaming |
| Hedging / swaps disclosure | **Partial** | Annual Report references commodity and FX hedges in the context of management's Underlying EBITDA definition (MTM gains/losses on hedges are excluded from underlying). Finance costs of ₹874 cr are net of any interest rate benefit. No specific interest rate swap schedule, notional amounts, or fixed-rate vs floating-rate composition of existing debt is available in the extracted data pool. | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | **Partial** | Annual Report Loan Covenants section (p.220) states that certain financing arrangements require "prior lender consent for undertaking new projects, issuing new securities, changes in management, mergers, sales of undertakings, material impairments and investments in subsidiaries." The Iveco merger (still awaiting French and Spanish regulatory approvals) has required approvals from lenders — the filing states "all approvals required so far have been timely received." No explicit cross-default or rating-trigger provisions are disclosed. | Hidden accelerants to distress |

---

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | **Y** |
| business-model/11_capital-allocation-governance.md | **Y** |
| business-model/03_segment-map.md | **Y** |
| earnings/01_historical-financials.md | **Y** |
| earnings/06_earnings-quality.md | **Y** |
| earnings/03_margin-drivers.md | **Y** |
| valuation/01_price-and-capital-structure.md | **N** (valuation module not yet run) |

All three key earnings inputs and two key business-model inputs are available. The valuation module has not run, so there is no EV-bridge cross-check from that module. The balance-sheet-survival module will build its own EV bridge from available data.

---

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | India | Listed on NSE (NSEI: TMCV) and BSE effective November 12, 2025 [FY26 Annual Report, Board's Report p.117] |
| Exchange | National Stock Exchange of India (NSE) and BSE Limited | Annual Report, Corporate Information; ticker NSEI:TMCV throughout all Capital IQ files |
| Filing regime | India / SEBI-LODR (SEBI Listing Obligations and Disclosure Requirements Regulations, 2015) | Board's Report cites Regulation 33 for quarterly results; Regulation 34(1) for the Annual Report; filed to both BSE and NSE [Annual Report cover letter, Jun 6, 2026] |
| Reporting standard | Ind AS (Indian Accounting Standards — effectively IFRS-converged) | Annual Report states "prepared in compliance with the applicable provisions of the Act and as stipulated under Regulation 33 of SEBI Listing Regulations as well as in accordance with the Indian Accounting Standards" [Board's Report, p.118]; Ind AS 116 (leases), Ind AS 37 (provisions) apply |
| Reporting currency | INR (Indian Rupees, crores) | All filings report in ₹ crores; Capital IQ balance sheet tab confirms "Currency: INR" |

Downstream agents must cite local-equivalent documents by their actual names (e.g., "SEBI LODR Reg 33 Preliminary Interim Report, year ended Mar 31, 2026, filed May 13, 2026, p.3" not "10-K" or "10-Q"). Credit ratings are CRISIL/ICRA/CARE/India Ratings (domestic), not only Moody's/S&P/Fitch. Borrowings notes use Ind AS nomenclature; operating-lease liabilities are on-balance-sheet under Ind AS 116. All figures carry INR denomination. Any reference to EUR amounts (Iveco deal) must include an FX rate.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | **N** | 02, 06 | Not applicable — maturity schedule is available from the Annual Report MD&A (within 1 yr ₹3,657 cr; 1–2 yr ₹1,357 cr; 2–5 yr ₹11 cr; >5 yr ₹243 cr) |
| No covenant disclosure | **Y** | 04, 06 | Covenants exist and compliance is stated (FY26: all covenants met), but exact thresholds for net-worth, liability, and debt ratios are not disclosed. Covenant headroom = "Not assessable at precise threshold level." Overall usefulness capped at max 75. Agents 04 and 06 must use typical-market-covenant assumptions labeled as such. |
| No cash flow statement | **N** | 03, 04, 06 | Not applicable — full CFO, investing, and financing cash flow statements are available for FY26 |
| No undrawn-facility disclosure | **N** | 03 | Not applicable — ₹3,750 cr unutilized fund-based working capital confirmed; ₹4,500 cr non-fund-based also disclosed |
| No interest-expense detail | **N** | 04 | Not applicable — finance costs ₹874 cr disclosed in P&L; interest paid ₹884 cr in cash flow; coverage ratios directly computable |
| No EBITDA base | **N** | 06 | Not applicable — Underlying EBITDA ₹10,314 cr and reported EBITDA ₹9,965 cr both available; stress test is runnable |

One additional partial flag not listed in the standard table:

| Covenant EBITDA definition not disclosed | **Y** | 04, 06 | Covenant headroom quality cannot be assessed; agents must flag "addback illusion" risk as uncertain; covenant confidence capped at max 60. |

---

## 6. Sufficiency Verdict

- **Verdict:** Sufficient

- **Reason:** TMCV has a recent audited consolidated balance sheet (Mar 31, 2026), a disclosed debt maturity schedule, a full cash flow statement, committed liquidity details, credit ratings from all three Indian agencies plus S&P investment-grade, and an EBITDA base — all the primary inputs for leverage, liquidity, coverage, and a downside stress test are present.

- **Sections that can run:** All six: (1) capital structure and leverage, (2) maturity wall and refinancing, (3) liquidity runway, (4) coverage and covenants, (5) off-balance-sheet and contingencies, (6) downside stress test.

- **Active partial-data caps:**
  - Covenant headroom: "Not assessable at precise threshold level" — exact covenant thresholds are not disclosed; agents 04 and 06 must proxy with typical market covenants for India AA-rated issuers, labeled as assumptions; overall usefulness capped at max 75.
  - Covenant EBITDA definition: not disclosed; "addback illusion" risk is uncertain; covenant confidence capped at max 60.
  - Pension/OPEB: not available from data pool — solvency agents should note this as a gap; quantitative impact on leverage is unknown (likely not material for a manufacturing company with a net-cash balance sheet, but cannot be confirmed).
  - HoldCo/OpCo post-Iveco: the EUR 3.8 bn acquisition facility (not yet drawn) introduces structural subordination risk that will need explicit treatment in the capital structure agent; the current (pre-drawdown) analysis must flag the contingent nature of this liability.

- **Critical missing items:**
  - Exact financial covenant thresholds (net-worth floor, leverage cap, coverage floor) — the single highest-value missing document is the loan covenant schedule / term sheet.
  - Pension/OPEB funded status for Indian employees (gratuity, PF).
  - Specific instrument-level details for the ₹2,300 cr NCDs (coupon rates, individual maturity dates, security) — the CG Report reference implies this exists in the full annual report but was not surfaced in the extracted pages.

- **Single highest-value missing document:** Loan covenant schedule (actual covenant thresholds and headroom as at Mar 31, 2026) — without this, precise covenant-breach risk cannot be quantified.

---

**Note on the Iveco acquisition (material forward risk):** The committed EUR 3.8 bn loan facility at TMLCVB (backed by a corporate guarantee EUR 1.9 bn + letter of comfort EUR 1.9 bn from TML) does NOT appear on TMCV's balance sheet as at Mar 31, 2026 because the acquisition has not closed. If and when it closes (targeted Q2 FY27), it will materially change the capital structure — converting a net-cash ₹13,713 cr entity into a significantly net-debt entity. Agents 01, 02, 03, and 06 must build a pre-Iveco and post-Iveco scenario and must flag this deal as the dominant solvency variable for forward analysis. The corporate guarantee and letter of comfort ARE disclosed off-balance-sheet obligations that must be captured by agent 05.
