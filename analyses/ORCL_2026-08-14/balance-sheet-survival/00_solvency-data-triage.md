# Solvency Data Triage — ORCL

## 1. File Inventory

Pool pre-extracted via `extract_pool.py` — 11 workbooks → 56 tabs, plus 10 single-stream documents (rtf/doc/pdf), 66 extract files total, **0 extraction failures** (manifest.json: 21/21 sources `status: ok`). Every workbook tab is listed below as its own row, reconciled against `_pool_extracts/manifest.md`.

| Filename | Type / Tab | Period Covered | Last Modified (sync date, not period) | Solvency Relevance |
|---|---|---|---|---|
| Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | Annual filing (10-K, mhtml) | FY2026, year ended May-31-2026 (filed Jun-22-2026) | Aug 13 19:32 | High |
| Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Quarterly filing (10-Q, mhtml) | Q3 FY2026, quarter ended Feb-28-2026 (filed Mar-11-2026) | Aug 13 19:32 | High |
| Oracle_Earnings Press Release Q4FY26.pdf | Earnings release | Q4 FY2026, quarter/year ended May-31-2026 | Aug 13 19:33 | Medium |
| Oracle_Latest_Earnings_Presentation-Slides-Q4-26.pdf | Investor deck | Q4 FY2026 | Aug 13 19:33 | Medium |
| Oracle Corporation, Q3 2026 Earnings Call, Mar 10, 2026.rtf | Transcript | Q3 FY2026 (Mar-10-2026) | Aug 13 19:31 | Medium |
| Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | Transcript | Q4 FY2026 (Jun-10-2026) | Aug 13 19:25 | Medium |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Key Stats | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Medium |
| … — Income Statement | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Medium |
| … — Balance Sheet | CIQ export tab | Annual, FY2017–FY2026 (as of May-31-2026) | Aug 13 19:24 | High |
| … — Cash Flow | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | High |
| … — Multiples | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Low |
| … — Historical Capitalization | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | High |
| … — Capital Structure Summary | CIQ export tab | Annual, FY2017–FY2026, incl. operating-lease commitment schedule (yrs 1–5, thereafter) | Aug 13 19:24 | High |
| … — Capital Structure Details | CIQ export tab | "FY2026 (May-31-2026) Capital Structure As Reported Details" — instrument-level debt table (type, principal, coupon, floating flag, maturity date, seniority, secured, currency) | Aug 13 19:24 | High |
| … — Ratios | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Medium |
| … — Supplemental | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Medium |
| … — Industry Specific | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Low |
| … — Pension OPEB | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Medium |
| … — Segments | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Key Stats | CIQ export tab | Quarterly, FQ Aug-2016–FQ May-2026 (~41 quarters) | Aug 13 17:05 | Medium |
| … — Income Statement | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | Medium |
| … — Balance Sheet | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | High |
| … — Cash Flow | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | High |
| … — Multiples | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | Low |
| … — Historical Capitalization | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | High |
| … — Capital Structure Summary | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | High |
| … — Capital Structure Details | CIQ export tab | Quarterly, latest capital structure detail | Aug 13 17:05 | High |
| … — Ratios | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | Medium |
| … — Supplemental | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | Medium |
| … — Industry Specific | CIQ export tab | Quarterly | Aug 13 17:05 | Low |
| … — Pension OPEB | CIQ export tab | Quarterly | Aug 13 17:05 | Medium |
| … — Segments | CIQ export tab | Quarterly | Aug 13 17:05 | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls — Summary | CIQ export tab | LTM ending 2026-05-31, financials updated 2026-06-23; peer set of 22 | Aug 14 00:14 | High |
| … — Financials | CIQ export tab | LTM 2022-05-31 through 2026-05-31; Operational/Solvency/Liquidity ratio panel vs 22-name peer mean | Aug 14 00:14 | High |
| … — Operational Metrics Charts | CIQ export tab | Same LTM series | Aug 14 00:14 | Low |
| … — Solvency Metrics Charts | CIQ export tab | Same LTM series | Aug 14 00:14 | Medium |
| … — Liquidity Metrics Charts | CIQ export tab | Same LTM series | Aug 14 00:14 | Medium |
| … — Disclaimer | CIQ export tab | n/a (methodology/legal) | Aug 14 00:14 | Low |
| Company Comparable Analysis Oracle Corporation.xls — Financial Data | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Trading Multiples | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Operating Statistics | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Business Description | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Implied Valuation | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Valuation Chart | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Credit Health Panel | CIQ export tab | As-of 2026-08-13 (comp-set solvency/liquidity scores) | Aug 13 16:48 | Medium |
| … — Disclaimer | CIQ export tab | n/a | Aug 13 16:48 | Low |
| ORCL_Charting Excel Export - Aug 13th 2026 4_48_01 pm.xls — Pane 1 | CIQ export tab | Price/volume time series | Aug 13 16:48 | Low |
| … — Raw | CIQ export tab | Empty (0×0) | Aug 13 16:48 | Low |
| … — Attributions | CIQ export tab | n/a | Aug 13 16:48 | Low |
| Oracle Corporation NYSE ORCL Events Calendar.xls — Events Calendar | CIQ export tab | Calendar year 2026 | Aug 14 00:13 | Low |
| Oracle Corporation NYSE ORCL Key Developments.xls — Key Developments | CIQ export tab | Trailing 1 year (incl. "Potential Red Flags/Distress Indicators", "Bankruptcy Updates", "Company Forecasts and Ratings" categories) | Aug 13 19:37 | Medium |
| Oracle Corporation NYSE ORCL Public Ownership History.xls — History | CIQ export tab | Quarterly, all history | Aug 14 00:15 | Low |
| Oracle Corporation NYSE ORCL Public Ownership Insider Trading.xls — Insider Trading | CIQ export tab | All history | Aug 13 19:38 | Low |
| OracleCorporationNYSEORCLEstimatesReport.xls — Consensus | CIQ export tab | Consensus estimates, US GAAP basis | Aug 13 16:48 | Low |
| … — Recent Changes | CIQ export tab | Recent estimate revisions | Aug 13 16:48 | Low |
| … — Guidance | CIQ export tab | Company guidance history | Aug 13 16:48 | Low |
| … — Multiples | CIQ export tab | Consensus-based multiples | Aug 13 16:48 | Low |
| … — Surprise | CIQ export tab | Earnings-surprise history | Aug 13 16:48 | Low |
| … — Trends | CIQ export tab | Estimate trend history | Aug 13 16:48 | Low |
| … — Revisions | CIQ export tab | Estimate revision history | Aug 13 16:48 | Low |
| Oracle_Short_Interest_Charting Excel Export Aug-13-2026 10_07 AM.xls — Chart 1 with Data | CIQ export tab | Short-interest time series | Aug 13 19:37 | Low |
| … — Attributions | CIQ export tab | n/a | Aug 13 19:37 | Low |
| Oracle Corporation NYSE ORCL Customers.rtf | Document (customer list) | n/a | Aug 14 00:13 | Low |
| Oracle Corporation NYSE ORCL Public Company Profile.rtf | Document (profile) | As of pool date | Aug 14 00:13 | Low |
| Oracle Corporation NYSE ORCL Public Ownership Summary.rtf | Document (ownership summary) | As of pool date | Aug 13 19:37 | Low |
| Oracle Corporation NYSE ORCL Suppliers.rtf | Document (supplier list) | n/a | Aug 14 00:13 | Low |

No documents under `data/ORCL/external/` — the directory does not exist in the pool. No external-data row or §1A table is required.

## 1A. External Data

Not applicable — `data/ORCL/external/` does not exist in the pool. No externally sourced research to inventory.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, vs. 2026-08-14) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | FY2026, year ended 2026-05-31 (filed 2026-06-22) | ~1.7 |
| Quarterly filing | Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Q3 FY2026, quarter ended 2026-02-28 (filed 2026-03-11) | ~5.5 (superseded for FY-end balance-sheet items by the FY26 10-K, above) |
| Debt / capital-structure export | Financials_Annual.xls — Capital Structure Details | FY2026 (as of 2026-05-31) | ~2.5 |
| Fixed-income / maturities export | Financials_Annual.xls — Capital Structure Details (Principal Due, Maturity, Coupon by instrument) | FY2026 (as of 2026-05-31) | ~2.5 |
| Cash flow statement | 10-K Consolidated Statements of Cash Flows / Financials_Annual.xls — Cash Flow | FY2026 (year ended 2026-05-31) | ~1.7 / ~2.5 |
| Covenant / credit-agreement disclosure | 10-K, Note on debt (Revolving Credit Agreement — min. 3.0x Consolidated EBITDA/Consolidated Net Interest Expense) | As of 2026-05-31 ("in compliance with all debt-related covenants") | ~1.7 |
| Credit rating report | Oracle Corporation NYSE ORCL Credit Health Panel.xls — Summary (S&P Foreign Currency LT: BBB-) | LTM ending 2026-05-31, financials updated 2026-06-23 | ~1.7 (Capital IQ vendor read of the S&P rating; no standalone Moody's/S&P/Fitch rationale report in the pool) |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | FY26 10-K, Consolidated Balance Sheets (May-31-2026 & 2025); Financials_Annual.xls — Balance Sheet | Debt, cash, equity base |
| Debt note (amounts by type) | Y | FY26 10-K, debt note (commercial paper, term loan, revolving credit, senior notes by series); Financials_Annual.xls — Capital Structure Details | The debt stack and seniority |
| Maturity schedule | Y | FY26 10-K debt note (maturity date per senior-note series, 2026–2066); Capital Structure Details tab (Maturity column, instrument-level) | The maturity wall and refinancing exposure |
| Cash flow statement | Y | FY26 10-K, Consolidated Statements of Cash Flows; Financials_Annual.xls — Cash Flow | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | FY26 10-K: $10.0bn 5-year Revolving Credit Agreement (Mar-2026), $0 drawn as of 2026-05-31; not borrowing-base structured | True liquidity beyond cash |
| Interest expense detail | Y | FY26 10-K income statement / debt note (coupon by series); Credit Health Panel — EBITDA/Interest 7.24x | Coverage ratios |
| Covenant disclosure | Y (threshold known; full addback definition not reproduced) | FY26 10-K: Revolving Credit Agreement requires Consolidated EBITDA/Consolidated Net Interest Expense ≥ 3.0x at each fiscal quarter-end; "we were in compliance with all debt-related covenants at May 31, 2026" | Headroom to a breach |
| Lease detail (operating/finance) | Y | FY26 10-K, lease note (ASC 842) — operating and finance lease ROU assets/liabilities, 5-yr commitment schedule; Capital Structure Summary — Operating Lease Commitment Due +1…+5, After 5 Yrs | Debt-like obligations |
| Pension / OPEB funded status | Y | FY26 10-K: "certain defined benefit pension plans...offered primarily by certain of our foreign subsidiaries," aggregate projected benefit obligation and funded status disclosed; Financials_Annual/Quarterly.xls — Pension OPEB tab | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | FY26 10-K, "Commitments and contingencies" note and Note 15 (litigation); risk-factor cross-reference at line ~6722 | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Partial | Capital IQ Credit Health Panel — S&P Foreign Currency LT: BBB-, as of 2026-06-23; no standalone Moody's/S&P/Fitch rating-rationale report in the pool | Refinancing access and cost |
| EBITDA base (for stress test) | Y | 10-K income statement (operating income + D&A); Financials_Annual.xls — Income Statement / Cash Flow (D&A); Credit Health Panel — EBITDA Margin 45.27% | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | 10-K cover page / business description: Systems Software, operating company (not a bank/insurer/REIT); parent-level unsecured debt structurally junior to subsidiary liabilities per debt note | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y | FY26 10-K: $10.0bn committed, unsecured, working-capital/general-corporate purpose, $0 drawn as of 2026-05-31 — not a borrowing-base facility, so full commitment is usable liquidity | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | Partial | 10-K states the ratio and the 3.0x threshold but references "Consolidated EBITDA" and "Consolidated Net Interest Expense" "as defined in the Revolving Credit Agreement" (Exhibit 10.14) — the full addback definition is not reproduced in the 10-K body and the exhibit's own text is not in the pool | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | Y | FY26 10-K debt note: "All existing and future liabilities of the subsidiaries of Oracle Corporation are or will be effectively senior to the senior notes and Commercial Paper Notes" — parent-issued unsecured debt is structurally subordinated to subsidiary liabilities | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Y | FY26 10-K: cross-currency interest rate swaps (EUR fixed → USD variable, entered fiscal 2018) and interest rate swaps converting Term Loan floating-rate borrowings to fixed; ASC 815 derivatives note | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | Partial | 10-K risk factors note a downgrade "could reduce our access to, or increase the cost of, commercial paper...affect the terms or availability of certain long-term commitments...increase collateral, letter of credit or other credit support requirements"; Revolving Credit Agreement has standard events-of-default language; no explicit "Change of Control" put or cross-default clause text located in the extracted 10-K body (full indentures/Exhibit 10.14 not in pool as standalone text) | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

All six business-model and earnings module files exist under `analyses/ORCL_2026-08-14/`. The full business-model (`00`–`12`, `99`, dossier) and earnings (`00`–`08`, `99`, dossier) sets have already run and completed.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-K cover page; Public Company Profile ("Primary Office Location: 2300 Oracle Way, Austin, TX") |
| Exchange | NYSE (ticker ORCL) | 10-K cover page; CIQ workbook headers throughout ("Oracle Corporation (NYSE:ORCL)") |
| Filing regime | US SEC | 10-K "ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934"; 10-Q under the same Act |
| Reporting standard | US GAAP | CIQ Estimates Report header ("Acctg. Standard: US GAAP"); 10-K accounting-policy notes (ASC 842 leases, ASC 815 derivatives, ASC 740 taxes) |
| Reporting currency | USD | 10-K financial statements; CIQ Financials_Annual/Quarterly headers ("Currency: USD"); one EUR-denominated senior note tranche noted separately in Capital Structure Details with its own "Repayment Currency: EUR" tag |
| Document language(s) | English (all documents) | 10-K, 10-Q, earnings calls, press release, deck, and all CIQ exports are in English — no non-English filings in this pool |

No non-US filing-regime mapping is needed — ORCL is a US domestic filer. US GAAP applies throughout; leases are capitalized under ASC 842 (both operating and finance lease ROU assets/liabilities appear on the balance sheet), so the debt-like-obligation view already reflects lease capitalization. Downstream agents should state "US GAAP" and "USD" on every figure per module convention, and flag the one EUR-denominated note tranche (3.125% due Jul-2025, now matured) separately if it recurs in FY27 detail.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N — instrument-level maturity dates are disclosed in both the 10-K debt note and the CIQ Capital Structure Details tab | 02, 06 | Not applicable |
| No covenant disclosure | N — the Revolving Credit Agreement's 3.0x min. EBITDA/interest covenant and compliance statement are disclosed; only the granular EBITDA-addback wording (Exhibit 10.14 text) is absent | 04, 06 | Not applicable (see note below on addback quality) |
| No cash flow statement | N — full Consolidated Statements of Cash Flows are in the 10-K and CIQ Cash Flow tabs (annual and quarterly) | 03, 04, 06 | Not applicable |
| No undrawn-facility disclosure | N — $10.0bn committed Revolving Credit Agreement, $0 drawn as of 2026-05-31, explicitly disclosed | 03 | Not applicable |
| No interest-expense detail | N — coupon-by-series and consolidated interest expense are disclosed | 04 | Not applicable |
| No EBITDA base | N — income statement and D&A detail support an EBITDA build for the stress test | 06 | Not applicable |

**One soft flag for downstream agent 04/06 (not a hard cap):** the Revolving Credit Agreement's covenant EBITDA and Net Interest Expense definitions are referenced but not reproduced verbatim in the 10-K body (the governing text sits in Exhibit 10.14, which is not itself extracted as standalone text in this pool). Agent 04 should compute headroom against the disclosed 3.0x threshold using GAAP-reported EBITDA/interest as the best available proxy, state that the covenant's own addback definition is unconfirmed, and flag the headroom read as "threshold known, addback quality unconfirmed" rather than applying the MODULE_RULES "assumed addback" cap outright (that cap is for cases with no known threshold at all).

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent, audited balance sheet (FY2026 10-K, year ended 2026-05-31), a full debt note with instrument-level amounts, coupons, seniority, and maturity dates, and a full cash flow statement are all present in both the primary filing and the Capital IQ workbook exports — so leverage, liquidity, coverage, and a stress test can all be built. Lease, pension, commitments-and-contingencies, hedging, and structural-subordination disclosures are also present, and the company is a US operating company (Systems Software), not a bank/insurer/REIT, so the module's standard debt/EBITDA framework applies without the Business Type Applicability Gate override.
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage/covenants, contingencies, stress test — all six.
- **Active partial-data caps:** None triggered from the MODULE_RULES Score Cap Rules table. One soft flag only: covenant-EBITDA addback definition not fully reproduced in the extracted text (see §5 note) — agent 04 should note this explicitly when stating covenant-headroom confidence, but it does not meet the bar for the "assumed covenant-EBITDA addbacks" hard cap (Covenant headroom max 60), because the threshold itself (3.0x) and a compliance attestation are both disclosed.
- **Critical missing items:** None.
- **Single highest-value missing document:** The full text of Exhibit 10.14 (the Revolving Credit Agreement itself) or a standalone Moody's/S&P/Fitch rating-rationale report — either would let agent 04 confirm the exact covenant-EBITDA addback definition and give agent 99 a primary-source credit rating instead of relying on the Capital IQ vendor read (S&P Foreign Currency LT: BBB-).
