# Valuation Data Triage — TMCV

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Key Stats | Capital structure / current price / multiples export | FY25–FY29E | 2026-06-07 | High |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Income Statement | Annual filing financials (P&L) | FY25, FY26 (press release) | 2026-06-07 | High |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Balance Sheet | Capital structure / balance sheet | FY25, FY26 (press release) | 2026-06-07 | High |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Cash Flow | Cash flow statement | FY25, FY26 (press release) | 2026-06-07 | High |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Multiples | Historical multiples export | Q3 FY26 – Jun 2026 (quarterly) | 2026-06-07 | High |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Historical Capitalization | Historical cap table | No data available | 2026-06-07 | Low |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Capital Structure Summary | Capital structure detail | No data available | 2026-06-07 | Low |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Ratios | Profitability / leverage / coverage ratios | FY25, FY26 | 2026-06-07 | High |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Supplemental | Stock-based comp, fair-value changes | FY25, FY26 | 2026-06-07 | Medium |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Industry Specific | Industry-specific data | No data available | 2026-06-07 | Low |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Pension OPEB | Pension / post-employment benefits | No data available | 2026-06-07 | Low |
| **Tata Motors Limited NSEI TMCV Financials.xls** — tab: Segments | Segment revenue and operating profit | FY25, FY26 | 2026-06-07 | High |
| Company Comparable Analysis Tata Motors Limited.xls | Peer / comps export | Unknown — extraction failed (OSError) | 2026-06-07 | High (pending fix) |
| Screenshot 2026-06-07 at 11.13.44 AM.png | Current price / Capital IQ Credit Health Panel | 2026-06-07 | 2026-06-07 | High |
| Tata Motors Limited NSEI TMCV Analyst Coverage.xls | Analyst coverage / estimates | Unknown — extraction failed (OSError) | 2026-06-07 | Medium |
| Tata Motors Limited NSEI TMCV Credit Health Panel.xls | Credit health / solvency data | Unknown — extraction failed (OSError) | 2026-06-07 | Medium |
| Tata Motors Limited NSEI TMCV Events Calendar.xls | Events calendar | Unknown — extraction failed (OSError) | 2026-06-07 | Low |
| Tata Motors Limited NSEI TMCV Professionals.rtf | Key professionals / IR contact | Current | 2026-06-07 | Low |
| Tata Motors Limited NSEI TMCV Public Holdings Detailed.xls | Detailed ownership/shareholding | Unknown — extraction failed (OSError) | 2026-06-07 | Medium |
| Tata Motors Limited NSEI TMCV Public Ownership Summary.rtf | Ownership summary — share count, institution vs public | Current | 2026-06-07 | High |
| Tata Motors.xlsx | Unknown — extraction failed (BadZipFile: not a zip) | Unknown | 2026-06-07 | Unknown |
| TataMotorsLimitedNSEITMCVEstimatesReport.xls | Consensus / estimates export | Unknown — extraction failed (OSError) | 2026-06-07 | High (pending fix) |
| Tata_Motors_Limited_-_Form_Preliminary_Interim_Report(May-13-2026).pdf | Quarterly filing — SEBI LODR Reg 33 (Q4 FY26 + FY26 audited P&L, balance sheet, cash flow) | Q4 FY26 / FY26 full year, filed 2026-05-13 | 2026-06-07 | High |
| Tata_Motors_Passenger_Vehicles_Limited_-_Form_Annual_Report(Jun-06-2026).pdf | Integrated Annual Report — SEBI LODR Reg 34 (FY26) | FY26, filed 2026-06-06 | 2026-06-07 | High |
| Tata_Motors_Passenger_Vehicles_Limited_-_Form_Annual_Report(May-23-2025).pdf | Integrated Annual Report — SEBI LODR Reg 34 (FY25) | FY25, filed 2026-05-23 | 2026-06-07 | High |
| Tata_Motors_Passenger_Vehicles_Limited_-_Form_Preliminary_Interim_Report(Jan-29-2026).pdf | Quarterly filing — SEBI LODR Reg 33 (Q3 FY26 / 9 months) | Q3 FY26, filed 2026-01-29 | 2026-06-07 | High |
| Tata_Motors_Passenger_Vehicles_Limited_-_Form_Preliminary_Interim_Report(May-10-2024).pdf | Information Memorandum for listing (scheme of arrangement) | Filed 2024-11-07 | 2026-06-07 | Medium |
| Tata_Motors_Passenger_Vehicles_Limited_-_Form_Preliminary_Interim_Report(Nov-07-2025).pdf | Quarterly filing — SEBI LODR Reg 33 (Q2 FY26) | Q2 FY26, filed 2026-11-07 | 2026-06-07 | High |
| Transcript Digest.pdf | Earnings transcript — TMCV FQ4 2026 (May 13, 2026) | FQ4 FY26, 2026-05-13 | 2026-06-07 | High |
| Transcript Digest (1).pdf | Earnings transcript — Ashok Leyland FQ4 2026 (peer) | FQ4 FY26, 2026-05-28 | 2026-06-07 | Medium |

**Note on extraction failures:** Six `.xls` files (Company Comparable Analysis, Analyst Coverage, Credit Health Panel, Events Calendar, Public Holdings Detailed, EstimatesReport) and one `.xlsx` (Tata Motors.xlsx — corrupted/not-a-zip) failed extraction due to OSError or format issues. Content of these files is not readable from the pool. The key multiples, estimates, capital structure, and financial data are nonetheless available through the successfully extracted tabs of `Tata Motors Limited NSEI TMCV Financials.xls` and the PDF filings. The EstimatesReport.xls and Company Comparable Analysis.xls failures are the most material — forward estimates are partially recoverable from the Key Stats tab and the earnings transcript, while peer comps are partially visible in the Credit Health Panel screenshot.

---

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | India — National Stock Exchange of India (NSE) and BSE | Ticker NSEI:TMCV; SEBI Listing Regulations cited throughout filings; letters addressed to BSE and NSE [Annual Report filing letter, Jun-06-2026] |
| Filing regime | India / SEBI-LODR (Reg 33 for quarterly results, Reg 34 for annual report) | SEBI (LODR) Regulations 2015, Reg 33 and Reg 52 citations in quarterly-filing cover letters [Q3 FY26 filing, Jan-29-2026; Q4 FY26 filing, May-13-2026] |
| Reporting standard | Ind AS (Indian Accounting Standards) | "Consolidated Audited Financial Results" per Ind AS; equity-accounted investees terminology; "Items that will not be reclassified to profit or loss" OCI format [Q4 FY26 preliminary results, May-13-2026] |
| Reporting currency (and scale) | INR (Indian Rupees), reported in crores (₹ in crores) in primary filings; Capital IQ exports in INR millions | Q4/FY26 results statement header: "(₹ in crores)"; Capital IQ Key Stats tab: "In Millions of the reported currency … Currency: INR" |
| Fiscal-year end | March 31 (Indian fiscal year) | "Year ended March 31, 2026" [Q4 FY26 preliminary results, May-13-2026]; FY26 annual report dated Jun-06-2026 |

**Downstream agents must cite the Indian-regime local equivalents:** SEBI LODR quarterly results (not "10-Q"), Integrated Annual Report (not "10-K"), AGM Notice / Board's Report (not "DEF 14A"), SAST/PIT/shareholding-pattern filings (not "Form 4/13D"). Do NOT mark any US form missing — no US forms are expected for an Indian-listed entity.

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | Tata_Motors_Passenger_Vehicles_Limited_-_Form_Annual_Report(Jun-06-2026).pdf | FY26 (year ended Mar-31-2026), filed Jun-06-2026 | 0 |
| Quarterly filing | Tata_Motors_Limited_-_Form_Preliminary_Interim_Report(May-13-2026).pdf | Q4 FY26 (Mar-31-2026), filed May-13-2026 | ~1 |
| Capital structure / balance sheet | Tata Motors Limited NSEI TMCV Financials.xls — Balance Sheet tab | Mar-31-2026 (press release) | ~2 |
| Consensus / estimate export | Key Stats tab (FY27–FY29E consensus) + Transcript Digest.pdf (FY27 consensus) | FY27–FY29E estimates; transcript consensus as of Apr-27-2026 | ~1–2 |
| Multiples export | Tata Motors Limited NSEI TMCV Financials.xls — Multiples tab | Quarter ending Jun-05-2026 (close) | 0 |
| Peer / comps export | Screenshot 2026-06-07 at 11.13.44 AM.png (Credit Health Panel — peer list visible) | Jun-07-2026 | 0 |
| Current price (Capital IQ) | Key Stats tab: Share Price 369.15 INR; Screenshot confirms Capital IQ current price | Capital IQ data as embedded in Key Stats tab | ~2 (export date Jun-07-2026) |
| Cash flow statement | Tata Motors Limited NSEI TMCV Financials.xls — Cash Flow tab | FY25, FY26 (press release) | ~2 |
| Segment data | Tata Motors Limited NSEI TMCV Financials.xls — Segments tab | FY25, FY26 | ~2 |

**Note on current price:** The Key Stats tab shows Share Price = INR 369.15. The screenshot (Capital IQ Credit Health Panel, dated Jun-07-2026) shows current price data for TMCV consistent with this figure. The source is Capital IQ (data vendor, Source Hierarchy tier 5) — not an IBKR screenshot (tier 4). This is adequate for valuation anchoring and should be labeled `Capital IQ Key Stats export, data as of approximately Jun-07-2026`.

---

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Capital IQ Key Stats tab: Share Price = INR 369.15; Screenshot 2026-06-07 | Anchor for market cap, EV, multiples, and margin of safety |
| Diluted share count | Y | Key Stats tab: Shares Out. 3,682.33 million; Balance Sheet: 3,681.72 million as of Mar-31-2026; Ownership Summary RTF: Total 3,682,331,373 shares | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Partial — Y for basic/diluted EPS (equal; minimal dilution), limited disclosure on options/RSU detail | Income Statement tab: Basic EPS = Diluted EPS = INR 8.23 (FY26) — implies minimal in-the-money dilution; Supplemental: Stock-based comp INR 110mm (very small vs market cap) | Needed for fully diluted per-share fair value — gap is immaterial given near-zero dilution effect |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | Operating — commercial vehicle manufacturer; single dominant segment (Automotive - Commercial Vehicle = 97% of operating revenue); Segments tab FY26 confirms | Determines which valuation methods are valid (FCFF DCF, EV multiples apply; DDM and P/NAV do not) |
| Total debt, cash, minority/preferred | Y | Balance Sheet tab Mar-31-2026: Total Debt = INR 56,150mm; Cash & ST Investments = INR 130,500mm; Net Debt = −INR 74,350mm (net cash position); Minority = 0; Preferred = 0 | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Income Statement tab: FY25 (Mar-31-2025) and FY26 (Mar-31-2026 press release); EBIT FY26 = INR 80,200mm; EBITDA FY26 = INR 99,650mm; Revenue FY26 = INR 849,790mm | Earnings and EBITDA base for multiples and DCF |
| Cash flow statement | Y | Cash Flow tab: CFO FY26 = INR 149,810mm; Capex FY26 = INR 13,210mm; FCF (CFO − capex) = INR 136,600mm | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y — partial; FY27–FY29E consensus available via Key Stats tab | Key Stats tab: FY27E Revenue INR 879,452mm, EBITDA INR 102,793mm, Net Income INR 66,006mm; EPS FY27E INR 18.12; EPS FY28E INR 21.94; EPS FY29E INR 24.37. Transcript Digest.pdf: FY27 consensus revenue INR 881,357mm, EPS normalized INR 19.17. Note: EstimatesReport.xls failed extraction — full consensus detail (revisions, surprise history, broker count) not accessible from pool | NTM/FY multiples and DCF near-term forecast path |
| Historical multiple data | Y | Multiples tab: quarterly LTM and NTM multiples for TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/BV back to Q4 FY26 | Own-history re-rating read |
| Peer / comps data | Partial | Screenshot shows peer list on Credit Health Panel (Ashok Leyland, Mahindra, Eicher, Weichai, CNHTC, Kailong, Sany, XCMG visible); Transcript Digest (1).pdf is Ashok Leyland (peer) FQ4 FY26 earnings. Company Comparable Analysis.xls extraction failed — detailed peer multiples not accessible from pool | Relative valuation requires peer multiples to be read from the screenshot or reconstructed; peer EBITDA/EPS not directly available in structured form |
| Segment-level revenue & EBIT | Y | Segments tab FY26: Automotive - Commercial Vehicle revenue INR 826,110mm (97.3% of total), Operating Profit INR 87,270mm; Corporate/Unallocable Operating Profit −INR 4,480mm; Others revenue INR 9,680mm, Operating Profit INR 1,350mm | Sum-of-the-parts — single dominant segment; SOTP collapses to consolidated read |
| Dividend / buyback data | Y — partial | Income Statement tab: DPS FY26 = INR 4.00; FY25 = N/A (company restructured mid-year); Cash Flow tab: Total Dividends Paid = 0 in FY26 statement (declared but may not be paid within period) | Shareholder-yield read |

---

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

**Management-governance module** is also complete (all 8 files present in `analyses/TMCV_2026-06-07/management-governance/`, including `04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md`). This enables the RF-OWN-004 (unaligned-owner / value-trap) read for downstream valuation agents, per MODULE_RULES.md §Cross-Module Inputs.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N | 01, 05, 07, 99 | No cap — price available (INR 369.15, Capital IQ Key Stats tab) |
| No consensus / forward estimates | N | 02, 03, 04, 05 | No cap — FY27–FY29E consensus available from Key Stats tab and transcript. Note: full broker-level detail (EstimatesReport.xls) failed extraction; downstream agents should flag this as a data-completeness limitation but consensus means are usable |
| No peer data | Partial — Y | 03, 06 | Overall usefulness max 70 — peer comps exist (screenshot + Ashok Leyland transcript) but structured peer multiples (Company Comparable Analysis.xls) failed extraction. Relative valuation can run on observable peers from screenshot but with lower precision |
| No segment-level data | N | 06 | No cap — segment data available, though SOTP collapses to consolidated (single dominant segment) |
| No balance sheet / capital structure | N | 01, 04, 06 | No cap — balance sheet fully available for FY25 and FY26 |
| No cash flow statement | N | 04 | No cap — CFO, capex, and FCF all available for FY25 and FY26 |

---

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Historical multiples available from Multiples tab (TEV/EBITDA, TEV/EBIT, P/E, P/BV at quarterly close). Two FY actuals available; CAGR series limited to two years but sufficient for own-history anchor |
| Peer relative valuation | Partial | Structured peer multiples (Company Comparable Analysis.xls failed extraction) | Peers identified (Ashok Leyland, Mahindra & Mahindra CV, Eicher Motors visible in screenshot). Ashok Leyland FQ4 FY26 transcript in pool. Agent can reconstruct peer read from screenshot and available transcripts but should flag lower confidence. Cap: overall usefulness max 70 |
| Intrinsic DCF (Operating FCFF) | Y | None | FCF base: CFO (INR 149,810mm) − capex (INR 13,210mm) = FCF INR 136,600mm for FY26. Income statement, balance sheet, and forward estimates all available. Segment data available for single-segment normalization |
| Reverse DCF | Y | None | Current price (INR 369.15) and shares outstanding available. EV bridge computable. Forward estimates available as benchmarks for implied-growth solve |
| SOTP | Partial — collapses to consolidated | No true multi-segment EBIT requiring separate multiples | Segments tab shows one dominant segment (97% of operating revenue and EBIT). SOTP agent should return "single-segment — SOTP collapses to consolidated read" per MODULE_RULES.md. No SOTP cap applies; this is correct analytical behavior |

---

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** Core financial data (income statement, balance sheet, cash flow, current price, share count, forward estimates, segment data) are fully available and support at least four valuation methods; however, the peer comps workbook (Company Comparable Analysis.xls) failed extraction, leaving structured peer multiples inaccessible from the pool and capping relative valuation precision.
- **Methods that can run:** own-history multiples, intrinsic DCF (FCFF), reverse-DCF, peer relative valuation (lower confidence — from screenshot and Ashok Leyland transcript), SOTP (collapses to consolidated single-segment read)
- **Active partial-data caps:**
  - No peer comps structured extract: overall usefulness max 70 for agent 03 (relative valuation)
  - Full broker-level consensus detail (EstimatesReport.xls) not readable: forward estimates are means only — confidence cap does not formally apply (means are available) but downstream agents should note the broker-count and revision-history gap
- **Critical missing items:**
  - Company Comparable Analysis.xls — extraction failed (OSError); downstream agent 03 must reconstruct peer multiples from screenshot and Ashok Leyland transcript or flag low-confidence
  - TataMotorsLimitedNSEITMCVEstimatesReport.xls — extraction failed (OSError); estimate revision history, surprise series, and individual-broker detail not available
  - Tata Motors.xlsx — corrupted / not-a-zip; content unknown; may duplicate another source
  - Historical Capitalization and Capital Structure Summary tabs returned "No data available" — multi-year historical cap table not extractable; own-history multiples limited to two annual data points plus quarterly close series
