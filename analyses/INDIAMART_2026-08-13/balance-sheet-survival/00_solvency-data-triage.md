# Solvency Data Triage — INDIAMART

Note on dates: every file in `data/INDIAMART/` carries the identical filesystem last-modified date of 2026-08-13, which is the Drive-sync date for this pool, not the document's real vintage (CLAUDE.md §27 fix F23). "Period Covered" below is read from inside each document. `_pool_extracts/manifest.md` reports **0 extraction failures** across 38 workbooks (81 tabs) + 47 non-workbook files (128 extracts total), so no source is downgraded to "missing" for extraction failure (fix F03). No files exist under `data/INDIAMART/external/`, so there is no Section 1A external-data table for this pool, and no `ciq_facts.json` sidecar is present in `_pool_extracts/` — all figures below are this agent's own sourced read of the workbooks/filings.

## 1. File Inventory

| Filename (+ Tab where applicable) | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | Annual filing — Integrated Annual Report + AGM Notice (audited, Ind AS) | FY ended Mar 31, 2026 | 2026-08-13 (sync) | **High** — debt note, contingent liabilities & commitments (Note 35), lease maturity table, pension/gratuity note, finance costs |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf | Annual filing (results-announcement version) | FY ended Mar 31, 2026 | 2026-08-13 (sync) | High — audited standalone + consolidated statements |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-29-2025).pdf | Annual filing (audited) | FY ended Mar 31, 2025 | 2026-08-13 (sync) | High — prior-year comparator |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Annual_Report(Apr-30-2026).pdf | Annual filing (preliminary) | FY ended Mar 31, 2026 | 2026-08-13 (sync) | Medium — superseded by full Annual Report |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | Quarterly filing (audited, SEBI LODR Reg 33) | Q1 FY27, qtr ended Jun 30, 2026 | 2026-08-13 (sync) | **High** — most recent balance sheet/cash flow |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jan-20-2026).pdf | Quarterly filing | Q3 FY26, qtr ended Dec 31, 2025 | 2026-08-13 (sync) | High |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Oct-17-2025).pdf | Quarterly filing | Q2 FY26, qtr ended Sep 30, 2025 | 2026-08-13 (sync) | High |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf | Quarterly filing | Q1 FY26, qtr ended Jun 30, 2025 | 2026-08-13 (sync) | High |
| 6× "Preliminary Interim Report" PDFs (Jul-21-2026, Jan-20-2026, Oct-17-2025, Jul-18-2025, Jan-22-2025, Jan-21-2025, Apr-29-2025, Apr-30-2026) | Quarterly filings (exchange-intimation / preliminary versions) | Q3 FY25 through Q1 FY27 | 2026-08-13 (sync) | Medium — duplicates/precursors of the final Interim/Annual Reports above |
| IndiaMART InterMESH Limited, Q1 2022–Q1 2027 Earnings Call*.pdf (21 files, Jan 2021 – Jul 2026) | Transcripts | FQ3 2021 through FQ1 2027 (~19 unbroken quarters) | 2026-08-13 (sync) | Medium — management commentary on cash use, capex, M&A funding |
| IndiaMART InterMESH Limited - ShareholderAnalyst Call.pdf | Transcript (ad hoc) | Jun 20, 2024 | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls — tab: Balance Sheet | CIQ export | FY Mar-2022 – FY Mar-2026 + Jun-30-2026 | 2026-08-13 (sync) | **High** — total debt, net debt, cash & ST investments |
| " " — tab: Cash Flow | CIQ export | FY Mar-2022 – LTM Jun-30-2026 | 2026-08-13 (sync) | **High** — CFO, capex, debt issued/repaid, dividends |
| " " — tab: Capital Structure Summary | CIQ export | FY Mar-2022 – Jun-30-2026 | 2026-08-13 (sync) | **High** |
| " " — tab: Capital Structure Details | CIQ export | FY2026 & FY2025 "as reported" details (filed Apr-30-2026) | 2026-08-13 (sync) | **High** — instrument-level: Lease Liabilities only, ₹231mn |
| " " — tab: Historical Capitalization | CIQ export | FY Mar-2022 – Jun-30-2026 | 2026-08-13 (sync) | Medium |
| " " — tab: Ratios | CIQ export | FY Mar-2022 – Jun-30-2026 | 2026-08-13 (sync) | High — coverage/leverage ratios |
| " " — tab: Key Stats | CIQ export | FY Mar-2022 – FY Mar-2029E | 2026-08-13 (sync) | Medium |
| " " — tab: Income Statement | CIQ export | FY Mar-2022 – LTM Jun-30-2026 | 2026-08-13 (sync) | High — EBITDA/EBIT base, interest |
| " " — tab: Multiples | CIQ export | Current + historical | 2026-08-13 (sync) | Low |
| " " — tab: Supplemental | CIQ export | FY Mar-2022 – Jun-30-2026 | 2026-08-13 (sync) | Medium |
| " " — tab: Industry Specific | CIQ export | FY Mar-2022 – Jun-30-2026 | 2026-08-13 (sync) | Low |
| " " — tab: Pension OPEB | CIQ export | FY Mar-2021 – FY Mar-2026 | 2026-08-13 (sync) | **High** — gratuity plan funded status |
| " " — tab: Segments | CIQ export | FY21–FY26 | 2026-08-13 (sync) | Medium (asset-sale capacity context) |
| IndiaMART ... Financials.xls (12 tabs) / Financials Balance Sheet.xls / Financials Capital Structure Details.xls / Financials Capital Structure Summary.xls / Financials Cash Flow.xls / Financials Income Statement (1).xls / Financials Income Statement.xls / Financials Key Stats.xls / Financials Pension OPEB.xls / Financials Ratios.xls / Financials Segments.xls / Financials Supplemental.xls | CIQ export | Same coverage as Financials (1).xls | 2026-08-13 (sync) | Duplicate/near-duplicate workbooks — treated as one source, not double-counted |
| IndiaMART InterMESH Limited NSEI INDIAMART Fixed Income Securities Summary.xls — tab: Securities Summary | CIQ export (fixed-income/maturities) | Current outstanding instruments | 2026-08-13 (sync) | **High** — only 2 tiny, zero-outstanding convertible notes at subsidiary Livekeeping Technologies; confirms no material bonds/loans |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls — tab: Summary | CIQ export (credit scoring) | LTM ending Jun-30-2026 vs peers | 2026-08-13 (sync) | **High** — Solvency score "Top" among 41 peers |
| " " — tab: Financials | CIQ export | LTM Jun-30-2026, Mar-2026, Mar-2025, Mar-2024, Mar-2023 (Company vs Group Mean) | 2026-08-13 (sync) | **High** — printed coverage/leverage/liquidity ratios |
| " " — tab: Operational Metrics Charts | CIQ export (chart, no printed values) | — | 2026-08-13 (sync) | Low |
| " " — tab: Solvency Metrics Charts | CIQ export (chart placeholders, no printed values — underlying numbers duplicated in the Financials tab) | — | 2026-08-13 (sync) | Low (numeric duplicate exists elsewhere) |
| " " — tab: Liquidity Metrics Charts | CIQ export (chart, no printed values) | — | 2026-08-13 (sync) | Low |
| " " — tab: Disclaimer | CIQ export | — | 2026-08-13 (sync) | None |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls — tab: Credit Health Panel | CIQ export | — | 2026-08-13 (sync) | Medium (peer comparables) |
| " " — tabs: Financial Data, Trading Multiples, Operating Statistics, Implied Valuation, Valuation Chart, Business Description, Disclaimer | CIQ export | — | 2026-08-13 (sync) | Low (valuation-module relevance, not solvency) |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls — 3 tabs (tree, Filtered Count, Aggregates) | CIQ export | Current | 2026-08-13 (sync) | Medium — confirms subsidiary map for HoldCo/OpCo check |
| IndiaMART InterMESH Limited NSEI INDIAMART Auditors.xls | CIQ export | Auditor history | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Board Members.xls / Committees.xls / Compensation Summary Compensation.xls | CIQ export | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Comparable M A Transactions.xls / Transaction Summary M A Private Placements.xls / Transaction Summary Public Offerings.xls | CIQ export | Historical | 2026-08-13 (sync) | Low–Medium (financing-history context) |
| IndiaMART InterMESH Limited NSEI INDIAMART Competitors.xls / Customers.xls / Suppliers.xls / Strategic Alliances.xls / Products.xls | CIQ export | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Corporate Timeline.xls / Events Calendar.xls / Key Developments.xls | CIQ export | Historical | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Co Investors.xls / Direct Investments.xls | CIQ export | Current | 2026-08-13 (sync) | Low–Medium (contra-liquidity: equity method/venture investments) |
| IndiaMART InterMESH Limited NSEI INDIAMART Analyst Coverage.rtf / Industry Classifications.rtf / Long Business Description.rtf / Offices.rtf / Private Ownership.rtf / Professionals.rtf / Public Company Profile.rtf / Public Ownership Summary.rtf | CIQ export (rtf) | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Transaction Advisors.xls / Transcripts.xls (index) | CIQ export | Historical / index | 2026-08-13 (sync) | Low |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls — 6 tabs (Consensus, Recent Changes, Multiples, Surprise, Trends, Revisions) + duplicate "(1)" file (Consensus tab only) | CIQ export (consensus estimates) | Consensus as of Jul-14-2026 | 2026-08-13 (sync) | Low (earnings/valuation-module relevance, not solvency) |

## 1A. External Data

Not applicable — `data/INDIAMART/external/` does not exist. No externally sourced research documents are in this pool.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | FY ended Mar 31, 2026 (published Jun 2, 2026) | ~2.4 |
| Quarterly filing | IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | Q1 FY27, qtr ended Jun 30, 2026 | ~0.7 |
| Debt / capital-structure export | Financials (1).xls — Capital Structure Details/Summary tabs | FY2026 "as reported" (filed Apr-30-2026); FY26/Jun-26 balance-sheet debt line | ~3.5 (as-reported detail) / ~0.7 (balance-sheet column) |
| Fixed-income / maturities export | Fixed Income Securities Summary.xls | Current outstanding instruments (2 zero-outstanding convertible notes at a subsidiary) | Current |
| Cash flow statement | Financials (1).xls — Cash Flow tab | LTM ended Jun 30, 2026 | ~0.7 |
| Covenant / credit-agreement disclosure | None in pool | — | — |
| Credit rating report | None — Annual Report states "List of all credit ratings obtained by the Company: Not Applicable" | FY26 Annual Report, Jun-02-2026 | ~2.4 (as of the statement) |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | FY26 Annual Report (Ind AS), Jun-02-2026; CIQ Financials (1).xls Balance Sheet tab, Jun-30-2026 column | Debt, cash, equity base |
| Debt note (amounts by type) | Y | FY26 Annual Report, Note on Borrowings/Lease Liabilities; CIQ Capital Structure Details.xls — Lease Liabilities ₹231.02mn FY26, ₹216.28mn Jun-26, only instrument on the balance sheet | The debt stack and seniority |
| Maturity schedule | Y | FY26 Annual Report — "maturity analysis of expected undiscounted cash flows for lease liabilities as at year end" (Ind AS 116 lease note); Fixed Income Securities Summary.xls confirms no bond/loan maturities to schedule (only 2 zero-outstanding subsidiary convertible notes, one maturing 2036) | The maturity wall and refinancing exposure |
| Cash flow statement | Y | FY26 Annual Report, Statement of Cash Flows; CIQ Financials (1).xls Cash Flow tab, FY22–LTM Jun-26 | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | N/A (none exists) | CIQ Cash Flow tab — "Total Debt Issued" = nil every period FY22–LTM Jun-26; Capital Structure Details lists only lease liabilities, no revolver/term loan | The company holds no bank facility to draw on; liquidity is cash + short-term investments only — this is a fact about the balance sheet, not an unavailable disclosure |
| Interest expense detail | Y | FY26 Annual Report, Note 22 (Finance costs) — ₹27.09mn FY26 vs ₹37.50mn FY25; CIQ Credit Health Panel Financials tab — EBITDA/Interest 177.78x FY26 | Coverage ratios |
| Covenant disclosure | N/A (none exists) | No hits for "covenant" anywhere in the FY26 Annual Report full text; consistent with a company carrying no covenant-bearing loan/bond agreements | Headroom to a breach — not assessable because there is no covenant-bearing debt, not because a note is missing |
| Lease detail (operating/finance) | Y | FY26 Annual Report — Ind AS 116 lease liability note with maturity table; CIQ Balance Sheet — Curr. Port. of Leases ₹100.12mn, LT Leases ₹130.9mn (FY26) | Debt-like obligations |
| Pension / OPEB funded status | Y | FY26 Annual Report, gratuity/defined-benefit note; CIQ Financials (1).xls Pension OPEB tab — PBO ₹827.66mn vs Plan Assets ₹236.58mn (FY26), net liability ₹591.1mn | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | FY26 Annual Report, Note 35 (Contingent liabilities and commitments) — Service tax/GST demands ₹219.18mn, capital commitments ₹3.64mn (FY26) vs ₹3.26mn (FY25) | Guarantees, LCs, litigation, tax claims |
| Credit ratings | N (genuinely absent) | FY26 Annual Report, BRSR section — "List of all credit ratings obtained by the Company: Not Applicable" | Refinancing access and cost — not assessable; company has no rated debt |
| EBITDA base (for stress test) | Y | CIQ Income Statement — EBITDA ₹5,140.44mn FY25, ₹5,314.65mn LTM Jun-26 (reconciliation gap flagged in `earnings/01_historical-financials.md` fn.7 — ~2.2% inconsistency across CIQ's own tabs, not a filing conflict) | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Industry Classifications.rtf — "Trading Companies and Distributors" primary classification; a B2B online marketplace, not a bank/insurer/REIT | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | N/A (none exists) | Same evidence as "Committed/undrawn facility" row above | Determines usable liquidity — moot, since no revolver exists |
| Covenant EBITDA definition (addbacks / caps) | N/A (none exists) | Same evidence as "Covenant disclosure" row above | Moot — no covenant-bearing debt to define an EBITDA basis for |
| HoldCo / OpCo structure disclosure | Y (and immaterial) | Corporate Structure Tree.xls — subsidiary map; Fixed Income Securities Summary.xls — the only non-lease "debt" instruments (2 zero-outstanding convertible notes) sit at subsidiary Livekeeping Technologies Private Limited, wholly owned, private-placement, ₹0.001 coupon, $0mm outstanding | Structural subordination and upstreaming — not material given the near-zero amounts |
| Hedging / swaps disclosure | Y (disclosed as absent) | FY26 Annual Report — "The Company is not engaged in commodity trading, hedging or exchange risk management activities" | Floating-rate exposure net of hedges — moot; company carries no floating-rate debt |
| Change-of-control / cross-default / rating triggers | N — "Not disclosed in the data pool" | No debt/credit-agreement disclosure of this kind found; consistent with the absence of any external loan/bond agreement | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

`business-model/11_capital-allocation-governance.md` already confirms, independently: "Total Debt/EBITDA is 0.04x and Net Debt/EBITDA is not meaningful (net cash)" [Financials Capital Structure Summary.xls — Total Debt ₹231.02mn, Total Cash & ST Investments ₹31,202.65mn, Net Debt −₹30,971.6mn, FY26], and that all financing (including the one control acquisition, Busy Infotech, $66.93mm) was self-funded with zero debt drawn [Financials Cash Flow.xls — Total Debt Issued = nil every period FY22–LTM Jun-26]. `earnings/01_historical-financials.md` independently reports "Net Debt / EBITDA: N/M (net cash)... Stable — net-cash throughout" for every year FY22–FY26.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | India (NSE: INDIAMART; BSE: 542726) | Every regulatory filing addressed "To, BSE Limited / National Stock Exchange of India Limited" [FY26 Annual Report letter, Jun-02-2026] |
| Exchange | NSE (primary) and BSE | [FY26 Annual Report, Jun-02-2026] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | India — SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015, plus Companies Act 2013 | "Regulations 30, 34 of SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015" [FY26 Annual Report/AGM letter, Jun-02-2026] |
| Reporting standard (US GAAP / IFRS / Ind AS) | Ind AS | "The Financial Statements of the Company complied with all aspects of Indian Accounting Standards (IND AS) notified under Section 133 of the Companies Act, 2013" [FY26 Integrated Annual Report, Jun-02-2026] |
| Reporting currency (USD / INR / …) | INR (₹); fiscal year ends March 31 | CIQ Financials export header: "Currency: INR" across all periods [Financials (1).xls, Balance Sheet/Cash Flow tabs]; filings for "financial year ended March 31" each year |
| Document language(s) | English (all filings, transcripts, and exports reviewed) | Direct reading of all extracts; no non-English source documents in this pool |

This module reads/cites the Integrated Annual Report's borrowings and lease notes, the Contingent Liabilities & Commitments note (Note 35), the SEBI LODR Reg 33 quarterly results, and NSE/BSE Reg 30 intimations as the local-equivalent documents (CLAUDE.md §27, MODULE_RULES Jurisdiction-Aware Sourcing) — do not mark this pool "missing a 10-K debt note", "missing an 8-K", or "missing a Moody's/S&P/Fitch rating"; those US/international-agency forms simply do not apply, and the absence of a CRISIL/ICRA/CARE/India Ratings rating here is explained by the company holding no external debt to rate (Annual Report BRSR section, "credit ratings: Not Applicable"), not by a missing local-equivalent document.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N — lease maturity table is disclosed (Ind AS 116 note); no bonds/loans exist to schedule | — | Not applied |
| No covenant disclosure | N (functionally) — no covenant-bearing debt exists (zero hits for "covenant" in the FY26 Annual Report; only ₹231mn of lease liabilities on the balance sheet); this is a structural fact, not an undisclosed note | 04, 06 | Covenant headroom = "Not assessable" is still the correct downstream statement (per MODULE_RULES literal rule), but 04/06 must state explicitly it reflects zero funded debt, not a data gap — do not apply the "assume typical market covenants" fallback, since there is no debt for such covenants to attach to. Overall usefulness is NOT capped at 75 for this reason (§24 Filter 3: net cash is a strategic asset, not a scored deficiency) |
| No cash flow statement | N — present (Annual Report + CIQ Cash Flow tab, FY22–LTM Jun-26) | — | Not applied |
| No undrawn-facility disclosure | N — no revolver/facility exists at all (Total Debt Issued = nil every period; only instrument is lease liabilities); liquidity is genuinely cash + short-term investments only, and that is the true, undistorted picture, not an understatement | 03 | Not applied |
| No interest-expense detail | N — Finance costs disclosed in Note 22 (₹27.09mn FY26); EBITDA/Interest 177.78x (CIQ Credit Health Panel) | 04 | Not applied |
| No EBITDA base | N — EBITDA present (₹5,140–5,315mn range FY25–LTM Jun-26); minor ~2.2% cross-tab reconciliation gap within CIQ's own workbooks is flagged in `earnings/01_historical-financials.md` fn.7, not a missing-base issue | 06 | Not applied |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent, audited balance sheet (FY26 Annual Report, Jun-02-2026, and Q1 FY27 Interim Report, Jul-21-2026) is available together with the debt note (only ₹231.02mn/₹216.28mn of lease liabilities — the company carries essentially zero financial debt and ₹31.2–33.9bn of net cash), a full cash flow statement (FY22 through LTM Jun-30-2026), an Ind AS 116 lease maturity table, a pension/gratuity funded-status note, and a Contingent Liabilities & Commitments note (Note 35) with cited figures — so leverage, liquidity, coverage, and a stress test can all be built. The absence of a committed-facility disclosure, covenant terms, and a credit rating reflects that IndiaMART genuinely holds no revolver, no covenant-bearing loan/bond agreement, and no rated debt (confirmed directly: "List of all credit ratings obtained by the Company: Not Applicable"; zero "covenant" hits in the full filing text; "Total Debt Issued" = nil in every period of the cash flow statement) — these are facts about a debt-free balance sheet, not gaps in the data pool.
- **Sections that can run:** capital structure (trivial debt stack — leases only), maturity wall (no bond/loan wall exists; lease maturity table only), liquidity (cash + short-term investments; no facility to add), coverage/covenants (coverage ratios computable from finance costs; covenant headroom is "Not assessable" by construction, not by data absence), contingencies (Note 35, GST demands + capital commitments), stress test (EBITDA base is available; downside case tests whether ₹31–34bn of net cash survives a 30–60% EBITDA haircut against near-zero maturities).
- **Active partial-data caps:** None of the six standard MODULE_RULES score-cap triggers bind. The one nuance worth flagging downstream: the "no covenant disclosure" line in the Solvency Usability Check is genuinely N/A (no covenant-bearing debt), not a real gap, so agents 04/06 should state covenant headroom as "Not assessable — no covenant-bearing debt exists" rather than inferring assumed market covenants, and should not treat this as a usefulness-limiting cap.
- **Critical missing items:** None.
- **Single highest-value missing document:** None strictly missing; if one additional document would sharpen the module, it would be a bank-facility/sanction letter or a statement from the company confirming it holds zero committed credit lines (currently inferred conservatively from "Total Debt Issued = nil" and the absence of any facility line item in the Capital Structure Details export), to remove any residual doubt that undrawn liquidity beyond cash could exist but be undisclosed.
