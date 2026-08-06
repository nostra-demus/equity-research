# Solvency Data Triage — UBER

**Scope note:** No primary SEC filing (10-K / 10-Q / 8-K) is physically present in `data/UBER/`. Every balance-sheet, debt, and cash-flow figure below is sourced from Capital IQ's vendor transcription of Uber's filings (source-hierarchy tier 5, CLAUDE.md §4) and is cited as "CIQ export," never as "10-K" or "10-Q." The verbatim Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record and is cited as such. This is consistent with the read already established by `business-model/00_data-triage.md` and `earnings/00_earnings-data-triage.md` for this same pool — carried forward here, not re-litigated. `_pool_extracts/manifest.json` reports **0 extraction failures** across all 5 workbooks / 37 tabs and 8 non-workbook documents — every document listed below is genuinely present and readable; nothing is a bad extraction.

## 1. File Inventory

Every file's on-disk "last modified" timestamp is **2026-08-06** for all 13 source files — this is the Drive-sync date, not the document's real period (CLAUDE.md §27 fix F23). Period Covered below is parsed from **inside** each document/tab.

| Filename | Type | Period Covered | Last Modified (sync date — not authoritative) | Solvency Relevance |
|---|---|---|---|---|
| Charting Excel Export Aug-05-2026 2_49 PM.xls — tab "Chart 1 with Data" | Workbook tab (284×2) | Price/volume history, multi-year through Aug-2026 | 2026-08-06 | Low |
| Charting Excel Export Aug-05-2026 2_49 PM.xls — tab "Attributions" | Workbook tab (45×1) | n/a (data-source credits) | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Financial Data" | Workbook tab (50×17) | LTM / recent annual peer financials | 2026-08-06 | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Trading Multiples" | Workbook tab (50×9) | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Operating Statistics" | Workbook tab (50×13) | LTM | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Business Description" | Workbook tab (44×3) | n/a (descriptive) | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Implied Valuation" | Workbook tab (69×9) | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Valuation Chart" | Workbook tab (32×2) | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Credit Health Panel" | Workbook tab (47×10) | As-of 2026-08-06; LTM ending 2026-06-30; financials updated 2026-08-05 | 2026-08-06 | **High** — Overall/Operational/Solvency/Liquidity credit-health ranks vs peer comp set, plus S&P Issuer Credit Rating (BBB+) |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Disclaimer" | Workbook tab (26×1) | n/a | 2026-08-06 | Low |
| Company_Comparable_Analysis_Uber_Technologies _Inc.rtf | RTF (comp-set summary) | As of 2026-08-06 | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | RTF | As of 2026-08-06 | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Board Members.rtf | RTF | As of 2026-08-06 | 2026-08-06 | Low (governance, not solvency) |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Key Stats" | Workbook tab (91×9) | As of 2026-08-05 | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Income Statement" | Workbook tab (118×7) | FY2021–FY2025 + LTM Jun-30-2026 | 2026-08-06 | High — interest expense, EBIT/EBITDA base |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Balance Sheet" | Workbook tab (96×7) | FY2021–FY2025 + Press-Release column Jun-30-2026 | 2026-08-06 | **High** — debt, cash, equity, leases |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Cash Flow" | Workbook tab (74×7) | FY2021–FY2025 + LTM Jun-30-2026 | 2026-08-06 | **High** — CFO, capex, FCF, cash interest paid, debt issued/repaid |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Multiples" | Workbook tab (91×9) | FY2021–LTM | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Historical Capitalization" | Workbook tab (39×7) | Quarterly, Dec-2024–Mar-2026 | 2026-08-06 | Medium — TEV bridge, quarterly debt/cash |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Capital Structure Summary" | Workbook tab (99×7) | FY2024, FY2025, Q1 FY2026 (Mar-31-2026) | 2026-08-06 | **High** — leverage ratios, fixed-payment/maturity schedule, undrawn credit, secured/unsecured split |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Capital Structure Details" | Workbook tab (46×10) | FY2025 (as reported, filed 2026-02-13) and FY2024 detail | 2026-08-06 | **High** — instrument-by-instrument debt stack: type, coupon, maturity, seniority, secured/unsecured, convertible |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Ratios" | Workbook tab (161×7) | FY2020–FY2025 | 2026-08-06 | Medium — EBITDA/EBIT margins |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Supplemental" | Workbook tab (72×7) | FY2020–FY2025 | 2026-08-06 | Low–Medium — NOL carryforwards, fair-value levels |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Industry Specific" | Workbook tab (15×6) | n/a | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Pension OPEB" | Workbook tab (15×6) | "No Data Available" | 2026-08-06 | n/a — Uber discloses no pension/OPEB plan; not a data gap, a true absence of the obligation |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Segments" | Workbook tab (53×7) | FY2021–FY2025 | 2026-08-06 | Medium — segment EBITDA (asset-sale/stress calibration) |
| Uber Technologies Inc NYSE UBER Products.rtf | RTF | n/a (descriptive) | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | RTF | As of 2026-08-06 | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | RTF | As of 2026-08-05/06 | 2026-08-06 | Medium — ownership, quote, market cap |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf | Transcript (primary call record) | Q2 FY2026 (quarter ended Jun-30-2026), call date 2026-08-05 | 2026-08-06 | **High** — management commentary on buybacks (~50% of FCF), Delivery Hero deal financing, balance-sheet capacity for AV bootstrapping |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — 7 tabs (Consensus, Recent Changes, Guidance, Multiples, Surprise, Trends, Revisions) | Workbook, 7 tabs | Consensus/estimate data through FY2027–FY2028 | 2026-08-06 | Low (earnings-consensus focus, not solvency) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — 7 tabs (duplicate of above) | Workbook, 7 tabs | Same as above | 2026-08-06 | Low — near-duplicate file of the "(1)" version |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | RTF (comprehensive CIQ company report incl. deal/M&A log, ownership, news) | As of 2026-08-06 | 2026-08-06 | **High** — Delivery Hero acquisition terms (€14bn committed bridge facility), ownership/holders detail, litigation news items |

## 1A. External Data

No `data/UBER/external/` directory exists in this pool. No externally sourced research (alt-data panels, expert calls, channel checks, broker research, paid-API pulls) is present. This section is empty by data-pool fact, not by omission — confirmed via a recursive filesystem search for `*external*` under `data/UBER/`, which returned nothing.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) — via CIQ export of the FY2025 10-K | Uber Technologies Inc NYSE UBER Financials.xls, "Balance Sheet" / "Capital Structure Details" tabs | FY2025 (Dec-31-2025), filed 2026-02-13 | ~6 |
| Quarterly filing — via CIQ Press-Release column, corroborated by the Q2 2026 earnings call | Uber Technologies Inc NYSE UBER Financials.xls, "Balance Sheet" / "Cash Flow" tabs ("Press Release" / LTM Jun-30-2026 columns) | Q2 FY2026 (Jun-30-2026), released 2026-08-05 | 0 |
| Debt / capital-structure export | Uber Technologies Inc NYSE UBER Financials.xls, "Capital Structure Summary" / "Capital Structure Details" tabs | FY2025 (Dec-31-2025) instrument detail; ratios roll to Q1 FY2026 (Mar-31-2026) | 4–6 |
| Fixed-income / maturities export | Uber Technologies Inc NYSE UBER Financials.xls, "Capital Structure Summary" tab, "Fixed Payment Schedule" rows | FY2024 and FY2025 annual snapshots (Due +1 through +5, and After 5 Yrs) | ~6 |
| Cash flow statement | Uber Technologies Inc NYSE UBER Financials.xls, "Cash Flow" tab | LTM ended Jun-30-2026 | 0 |
| Covenant / credit-agreement disclosure | — | **Not in the pool** | n/a |
| Credit rating report | Company Comparable Analysis Uber Technologies Inc.xls, "Credit Health Panel" tab (S&P Issuer Credit Rating Foreign Currency LT Rating) | As of 2026-08-06 | 0 |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | Financials.xls, Balance Sheet tab, FY2025 + Jun-30-2026 Press-Release column | Debt, cash, equity base |
| Debt note (amounts by type) | Y | Financials.xls, Capital Structure Details tab — instrument-level: bonds/notes, exchangeable notes, commercial paper, finance leases, operating-lease liabilities, revolver, with coupon, seniority, secured/unsecured, convertible flag | The debt stack and seniority |
| Maturity schedule | Y | Financials.xls, Capital Structure Summary tab, "Fixed Payment Schedule" (Due +1 through +5, After 5 Yrs) and Capital Structure Details tab (per-instrument maturity dates 2027–2054) | The maturity wall and refinancing exposure |
| Cash flow statement | Y | Financials.xls, Cash Flow tab, FY2021–LTM Jun-30-2026 | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | Financials.xls, Capital Structure Summary tab, "Available Credit" — Undrawn Commercial Paper $2,000mm, Undrawn Revolving Credit $4,657mm (FY2025) / $4,668mm (Q1 FY2026); revolver maturity 2029-09-26, unsecured | True liquidity beyond cash |
| Interest expense detail | Y | Financials.xls, Income Statement tab — "Interest Expense" and "Net Interest Exp." rows, all periods FY2021–LTM | Coverage ratios |
| Covenant disclosure | **N** | Not disclosed anywhere in the pool — no credit agreement, indenture, or covenant summary is present; the Capital Structure Details/Summary tabs give instrument terms (coupon, maturity, security) but no maintenance-covenant thresholds | Headroom to a breach |
| Lease detail (operating/finance) | Y | Financials.xls, Balance Sheet tab (Curr./LT lease liabilities) and Capital Structure Details tab (Finance Leases $222mm, Operating Lease Liabilities $1,559mm, both FY2025) | Debt-like obligations |
| Pension / OPEB funded status | N/A | Financials.xls, Pension/OPEB tab — "No Data Available" | Uber discloses no pension/OPEB plan; a true absence of the obligation, not a missing disclosure |
| Commitments & contingencies note | Partial | No dedicated commitments/contingencies note is in the pool; individual litigation items surface only as news items in UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf (e.g. a wrongful-death lawsuit filed 2026, no recorded liability or maximum-exposure figure given) and the Delivery Hero deal termination fees (Uber pays €700mm if it walks, Delivery Hero pays €200mm) | Guarantees, LCs, litigation, tax claims — figures are incomplete, not zero |
| Credit ratings | Y | Company Comparable Analysis Uber Technologies Inc.xls, Credit Health Panel tab — S&P Issuer Credit Rating Foreign Currency LT Rating: **BBB+**, as of 2026-08-06 | Refinancing access and cost |
| EBITDA base (for stress test) | Y | Financials.xls, Income Statement tab (reported/GAAP EBITDA) and earnings/01_historical-financials.md (Adj. EBITDA, company-defined, cross-checked to Segments tab) | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Public Company Profile.rtf — "Passenger Ground Transportation" primary industry classification; asset-light operating technology platform, not a bank/insurer/REIT; single consolidated NYSE-listed entity, no disclosed material HoldCo-level debt | Selects the correct framework (Business Type Applicability Gate) — this is a standard operating-company analysis, not the financial-institution override |
| Revolver terms + availability / borrowing base | Y | Financials.xls, Capital Structure Summary tab — Senior Unsecured Revolving Loans, $0 drawn, $4,657–4,668mm undrawn, maturity 2029-09-26; commitment size not itemized separately from the undrawn figure but availability itself is disclosed (not a borrowing-base facility on the evidence available) | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | **N** | Not disclosed — no covenant-EBITDA definition, addback list, or addback cap appears anywhere in the pool | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | Y (not applicable) | No material HoldCo-level debt or subordinated financing structure is evident in Capital Structure Details — all listed instruments are issued at the single reporting entity level; Careem and other subsidiaries appear in the ownership/M&A log without a disclosed structural-subordination note | Structural subordination and upstreaming — not a live risk on current evidence, but not affirmatively ruled out by a dedicated disclosure either |
| Hedging / swaps disclosure | **N** | Not disclosed — Capital Structure Summary shows "Variable Rate Debt: 0" (all disclosed debt is fixed-rate) but no dedicated hedging/derivatives note is in the pool to confirm whether the pending €14bn Delivery Hero bridge facility will carry floating-rate exposure or hedges | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | **N** | Not disclosed in the data pool — the only trigger-like terms found relate to the pending Delivery Hero deal itself (a €700mm/€200mm reciprocal break fee), not to Uber's existing bond/revolver documentation | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

`business-model/11_capital-allocation-governance.md` already flags the July-2026 Delivery Hero acquisition (€12.9bn / $14.8bn equity value) financed by a **~€14 billion committed bridge facility** (affiliates of Morgan Stanley, Bank of America, and Deutsche Bank), on top of ~$4bn of Delivery Hero market purchases already funded from Uber's own balance sheet in Q2 2026. This is confirmed independently in `UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf`'s deal-summary text. **None of this bridge facility appears in the FY2025 or Q1-Q2 FY2026 balance-sheet/debt-stack figures above** — it is a signed-but-undrawn, not-yet-closed commitment (offer expected H2 2027, subject to a 50%+1-share acceptance threshold and merger-control/competition/financial-regulatory approvals). Downstream agents (01 capital structure, 02 maturity wall, 06 stress test) must treat this as a **material, near-certain future addition to gross debt** that the current-period leverage ratios do not yet reflect, and should state both the "as-reported" leverage and a pro-forma view that layers in the bridge facility, labelled as such.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | Public Company Profile.rtf, "Primary Office Location: San Francisco, CA" |
| Exchange | NYSE (ticker UBER) | Public Company Profile.rtf, "Ticker: UBER (NYSE)" |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | Domestic US issuer; CIQ exports transcribe the FY2025 10-K (filed 2026-02-13, per Balance Sheet tab "Filing Date" row) and quarterly results |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | Standard CIQ "Reported Currency" / "Latest Filings" restatement basis for a US domestic filer; no IFRS/Ind AS labeling anywhere in the pool |
| Reporting currency (USD / INR / …) | USD | All tabs, "Currency: USD"; Delivery Hero deal terms are stated in EUR in the source documents and used verbatim (€41.50/share, €12.9bn equity value / $14.8bn, ~€14bn bridge facility) — not re-derived |
| Document language(s) | English (all documents); the Delivery Hero deal-summary text itself references a German-domiciled target (XTRA:DHER) but the CIQ narrative describing it is in English | UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf |

No non-English source documents are present in this pool, so the CLAUDE.md §27 language-is-not-a-gap provision is not triggered here — noted for completeness per the triage template.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N | 02, 06 | Not applicable — maturity schedule is present (Fixed Payment Schedule, Capital Structure Summary tab) |
| No covenant disclosure | **Y** | 04, 06 | Covenant headroom = "Not assessable" (or must be built on a labeled, market-typical assumption if agent 04 chooses); Overall usefulness max 75 |
| No cash flow statement | N | 03, 04, 06 | Not applicable — cash flow statement is present through LTM Jun-30-2026 |
| No undrawn-facility disclosure | N | 03 | Not applicable — undrawn commercial paper and revolver amounts are disclosed |
| No interest-expense detail | N | 04 | Not applicable — Interest Expense and Net Interest Exp. lines are disclosed for every period |
| No EBITDA base | N | 06 | Not applicable — both reported/GAAP EBITDA and company-defined Adj. EBITDA are available and cross-checked against `earnings/01_historical-financials.md` |

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** The core triad — a recent balance sheet, an instrument-level debt note with maturities, and a cash flow statement — is fully present and current (balance sheet and cash flow both roll to Jun-30-2026; the debt note is FY2025, filed 2026-02-13, ~6 months old), so leverage, liquidity, coverage, and the downside stress test can all be built. The single missing item is covenant disclosure: no credit agreement, indenture, or covenant-threshold summary is anywhere in the pool, so true covenant headroom cannot be computed — only the instrument-level terms (coupon, maturity, security) are known. This one gap is enough, per the module's own Partial rule, to keep the verdict at Partial rather than Sufficient.
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage (interest coverage computable; covenant headroom cannot), contingencies (partial — no dedicated commitments/contingencies note, only scattered litigation items and M&A break fees), stress test
- **Active partial-data caps:**
  - No covenant disclosure → covenant headroom = "Not assessable" in agent 04; Overall usefulness capped at 75 (MODULE_RULES.md Score Cap Rules)
  - Off-balance-sheet exposures (litigation, contingent liabilities) are not comprehensively disclosed for a name with visible litigation exposure (see wrongful-death suit in the CIQ landscape report) → Solvency strength max 75 (MODULE_RULES.md Score Cap Rules: "Off-balance-sheet exposures undisclosed for a known-litigious/levered name")
- **Critical missing items:**
  - Covenant thresholds and covenant-EBITDA definition/addback detail (no credit agreement or indenture terms in the pool)
  - A dedicated commitments & contingencies note (recorded liability vs. maximum exposure) — only scattered litigation news items and M&A break-fee terms are available
  - Hedging/derivatives disclosure for the pending ~€14bn Delivery Hero bridge facility (currently all disclosed debt is fixed-rate; the bridge facility's rate structure and any hedges are not disclosed in this pool)
  - Change-of-control / cross-default / rating-trigger language on Uber's own existing bond/revolver documentation (not disclosed)
- **Single highest-value missing document:** The credit agreement / bond indenture covenant package (maintenance-covenant thresholds, covenant-EBITDA definition and addback caps, cross-default and change-of-control language) — this single document would resolve the covenant-headroom gap, the covenant-EBITDA-quality gap, and the trigger-scan gap simultaneously, and is the one gap keeping this verdict at Partial rather than Sufficient. A close second: the pending Delivery Hero bridge-facility term sheet (rate structure, covenants, hedging), given it is about to become Uber's single largest debt instrument.
