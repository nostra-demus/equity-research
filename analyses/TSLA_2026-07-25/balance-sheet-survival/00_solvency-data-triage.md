# Solvency Data Triage — TSLA

## 1. File Inventory

Pool extraction confirmed fresh: 11 workbooks → 54 tabs; 64 total extract files; 0 extraction failures (`_pool_extracts/manifest.md`, `manifest.json` — every `status` is `ok`). No `data/TSLA/external/` folder exists, so no externally-sourced documents are in this pool.

| Filename | Type | Period Covered | Last Modified (Drive sync date — not filing date) | Solvency Relevance |
|---|---|---|---|---|
| Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Quarterly filing (10-Q) | Quarter ended Jun-30-2026, filed Jul-23-2026 | 2026-07-24 | High — full debt note (Note 8), balance sheet, cash flow, commitments & contingencies |
| Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc | Annual filing amendment (10-K/A, Part III only) | FY ended Dec-31-2025; amendment filed Apr-30-2026 | 2026-07-24 | Medium — governance/comp/ownership only; explicitly does NOT restate or include financial statements, debt note, or contingencies (states "does not otherwise change or update any of the disclosures set forth in the Original Form 10-K") |
| Annual_Report_TSLA-Q4-2025.pdf | Investor deck ("Q4 and FY 2025 Update") — NOT the 10-K itself | Q4/FY2025 (period ended Dec-31-2025) | 2026-07-24 | Medium — includes an unaudited summarized balance sheet, income statement, and cash flow (pp.27+), sourced from the FY2025 10-K, but not the full debt/contingency notes |
| Annual_Report_TSLA-Q4-2024.pdf | Investor deck ("Q4 and FY 2024 Update") — NOT the 10-K itself | Q4/FY2024 (period ended Dec-31-2024) | 2026-07-24 | Medium — same structure as above, one year older |
| TSLA-Q2-2026-Update.pdf | Investor deck | Q2 2026 (period ended Jun-30-2026) | 2026-07-24 | Medium — summarized financial statements, cash/FCF commentary |
| TSLA-Q1-2026-Update.pdf | Investor deck | Q1 2026 (period ended Mar-31-2026) | 2026-07-24 | Medium |
| Tesla, Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf | Transcript | Q2 2026 (call held Jul-22-2026) | 2026-07-24 | Medium — management commentary on cash, capex, liquidity |
| Tesla, Inc., Q1 2026 Earnings Call, Apr 22, 2026.rtf | Transcript | Q1 2026 (call held Apr-22-2026) | 2026-07-24 | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Key Stats | Debt / capital-structure export (CIQ) tab | Quarterly series through Jun-30-2026 | 2026-07-24 | High |
| … — Income Statement | CIQ tab | Quarterly series through Jun-30-2026 | 2026-07-24 | Medium (EBITDA base) |
| … — Balance Sheet | CIQ tab | Quarterly series through Jun-30-2026 | 2026-07-24 | High |
| … — Cash Flow | CIQ tab | Quarterly series through Jun-30-2026 | 2026-07-24 | High |
| … — Multiples | CIQ tab | Quarterly series | 2026-07-24 | Low |
| … — Historical Capitalization | CIQ tab | Quarterly series | 2026-07-24 | High |
| … — Capital Structure Summary | CIQ tab | Quarterly series through Jun-30-2026 | 2026-07-24 | High — gross/net debt, leverage ratios by period |
| … — Capital Structure Details | CIQ tab | "Source: Q2 2026 filed Jul-23-2026" — instrument-level as of FY2025 (Dec-31-2025) and FY2024 | 2026-07-24 | High — instrument-level type/coupon/maturity/seniority/secured/currency |
| … — Ratios | CIQ tab | Quarterly series | 2026-07-24 | High — EBITDA/Interest, (EBITDA-capex)/Interest coverage series |
| … — Supplemental | CIQ tab | Quarterly series | 2026-07-24 | Low-Medium |
| … — Industry Specific | CIQ tab | Quarterly series | 2026-07-24 | Low |
| … — Pension OPEB | CIQ tab | Quarterly series | 2026-07-24 | Low — tab is blank/no data, consistent with no material defined-benefit obligation |
| … — Segments | CIQ tab | Quarterly series | 2026-07-24 | Low (business-model relevance, not solvency) |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — [same 14 tabs as Quarterly above] | CIQ tabs | Annual series FY2017–FY2025 | 2026-07-24 | High (same set, annual cadence) |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Summary | CIQ tab | LTM ending Jun-30-2026, financials updated 2026-07-23 | 2026-07-24 | High — CIQ relative Solvency/Liquidity scores + S&P Foreign-Currency LT rating (BBB) vs 31 peers |
| … — Financials | CIQ tab | LTM series | 2026-07-24 | Medium |
| … — Operational Metrics Charts | CIQ tab | LTM series | 2026-07-24 | Low |
| … — Solvency Metrics Charts | CIQ tab | LTM series | 2026-07-24 | Medium |
| … — Liquidity Metrics Charts | CIQ tab | LTM series | 2026-07-24 | Medium |
| … — Disclaimer | CIQ tab | — | 2026-07-24 | None |
| Tesla Inc NasdaqGS TSLA Public Company Profile.rtf | CIQ profile export | Snapshot as of 2026-07-24 | 2026-07-24 | Medium — carries the S&P Global Ratings issuer credit rating block (Local & Foreign Currency LT: BBB, Stable, rating action dated Oct-06-2022) |
| Tesla Inc NasdaqGS TSLA Key Developments.xls — Key Developments | CIQ tab | Historical event log | 2026-07-24 | Low-Medium — could carry rating-action or default events; not solvency-primary |
| Company Comparable Analysis Tesla Inc .xls — Credit Health Panel | CIQ tab (duplicate of dedicated Credit Health Panel workbook) | Snapshot | 2026-07-24 | Medium |
| … — Financial Data / Trading Multiples / Operating Statistics / Implied Valuation / Valuation Chart / Business Description / Disclaimer | CIQ tabs | Snapshot / peer comps | 2026-07-24 | Low — valuation-comps focused, not solvency |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Consensus / Recent Changes / Guidance / Multiples / Surprise / Trends / Revisions (7 tabs) | CIQ tabs | Forward estimates | 2026-07-24 | Low — consensus/estimates, not solvency data |
| Tesla Inc NasdaqGS TSLA Customers.xls — Customers | CIQ tab | Snapshot | 2026-07-24 | Low |
| Tesla Inc NasdaqGS TSLA Events Calendar.xls — Events Calendar | CIQ tab | Forward calendar | 2026-07-24 | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership History.xls — History | CIQ tab | Historical ownership | 2026-07-24 | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership Insider Trading.xls — Insider Trading | CIQ tab | Historical | 2026-07-24 | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership Summary.rtf | CIQ export | Snapshot | 2026-07-24 | Low |
| Short_Interest_12m_TSLA.xls — Chart 1 with Data / Attributions (2 tabs) | CIQ tab | Trailing 12 months | 2026-07-24 | None (not solvency-relevant) |

No document in this pool is in a non-English language; all sources are English-language SEC/CIQ exports. No language-related gap exists (CLAUDE.md §27).

## 1A. External Data

Not applicable — `data/TSLA/external/` does not exist. No externally sourced documents are in this pool.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Not directly present as a standalone 10-K. Best available: 10-Q Note 8 (Debt) + Note (Commitments & Contingencies), both of which reconcile back to the audited Dec-31-2025 balance sheet | Interim filing carries forward FY2025 audited opening balances; period ended Jun-30-2026, filed Jul-23-2026 | ~0 |
| Quarterly filing | Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Quarter ended Jun-30-2026, filed Jul-23-2026 | ~0 |
| Debt / capital-structure export | Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls, "Capital Structure Details" & "Capital Structure Summary" tabs | Instrument detail as of FY2025 (Dec-31-2025); summary ratios through Jun-30-2026; workbook sourced "Q2 2026 filed Jul-23-2026" | ~0–7 (mixed vintages within the tab) |
| Fixed-income / maturities export | Same "Capital Structure Details" tab — instrument-level maturity dates, coupons, seniority, secured status | As of Dec-31-2025 (FY2025) | ~7 |
| Cash flow statement | 10-Q (six months ended Jun-30-2026) + CIQ Financials_Quarterly.xls "Cash Flow" tab | Six months ended Jun-30-2026 | ~0 |
| Covenant / credit-agreement disclosure | 10-Q, Note 8 (Debt) narrative: "As of June 30, 2026, we were in material compliance with all financial debt covenants" | As of Jun-30-2026 | ~0, but no threshold/definition disclosed (see §5) |
| Credit rating report | Tesla Inc NasdaqGS TSLA Public Company Profile.rtf, "S&P Global Ratings Credit Ratings" block: Issuer Credit Rating (Local & Foreign Currency LT) BBB, Stable outlook | Rating action dated Oct-06-2022; CIQ data feed refreshed 2026-07-24 | ~45 (rating action itself is stale; only one agency in the pool — no Moody's/Fitch) |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | 10-Q, Consolidated Balance Sheets as of Jun-30-2026 (period-end derived from audited Dec-31-2025 balance sheet) [Q2 FY26 10-Q]; CIQ Financials_Quarterly.xls, Balance Sheet tab | Debt, cash, equity base |
| Debt note (amounts by type) | Y | 10-Q, Note 8 (Debt): Recourse (RCF Credit Agreement, Other) and Non-recourse (Automotive Asset-Backed Notes, etc.) with unpaid principal, net carrying value, rates, and maturities [Q2 FY26 10-Q, Note 8]; CIQ Capital Structure Details tab (instrument-level, FY2025) | The debt stack and seniority |
| Maturity schedule | Y (instrument-level, not yet aggregated into a year-by-year wall) | 10-Q Note 8 gives per-instrument maturity dates/ranges (e.g. RCF Jan-2028, Automotive ABS Jun-2027–2035); CIQ Capital Structure Details tab gives the same by instrument for FY2025/FY2024 | The maturity wall and refinancing exposure — agent 02 must aggregate these into a by-year wall |
| Cash flow statement | Y | 10-Q, Condensed Consolidated Statements of Cash Flows (six months ended Jun-30-2026) [Q2 FY26 10-Q]; CIQ Financials Cash Flow tabs (quarterly + annual) | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | 10-Q MD&A: "We had $5.00 billion of unused committed credit amounts as of June 30, 2026" [Q2 FY26 10-Q, Liquidity section]; RCF Credit Agreement shows $0 drawn / $5,000M unused committed in Note 8 table | True liquidity beyond cash |
| Interest expense detail | Y (via ratio series; income-statement interest-expense line not directly grepped but implied by CIQ EBITDA/Interest ratio series) | CIQ Financials Ratios tab: "EBITDA / Interest Exp." and "(EBITDA-CAPEX) / Interest Exp." quarterly series | Coverage ratios |
| Covenant disclosure | Partial | 10-Q, Note 8: "As of June 30, 2026, we were in material compliance with all financial debt covenants" — a compliance affirmation only, no threshold, ratio, or covenant-EBITDA definition disclosed anywhere in the pool | Headroom to a breach — not quantifiable from this pool |
| Lease detail (operating/finance) | Y | 10-Q balance sheet lines "Operating lease right-of-use assets," "Operating lease liabilities," "Finance leases" within debt table; CIQ Capital Structure Details tab: Finance Lease $223M @4.70%, Operating Lease $6,343M @5.00% (FY2025) | Debt-like obligations |
| Pension / OPEB funded status | N (not material / not disclosed) | CIQ Financials_Annual.xls, "Pension OPEB" tab is blank across all periods; no defined-benefit pension note found in 10-Q or 10-K/A text search | Off-balance-sheet obligation — appears immaterial for Tesla (no defined-benefit plan disclosed) |
| Commitments & contingencies note | Y | 10-Q, "Commitments and Contingencies" note (litigation incl. discrimination/harassment claims, product/services litigation, resale-value guarantee liabilities with stated maximum exposure) [Q2 FY26 10-Q] | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y (thin) | Public Company Profile.rtf: S&P Global Ratings, Issuer Credit Rating (Local & Foreign Currency LT) BBB, Stable, action dated 2022-10-06 | Refinancing access and cost — only one agency present, and the rating action itself is ~45 months old (only the CIQ data feed pull is current) |
| EBITDA base (for stress test) | Y | CIQ Financials Annual/Quarterly Income Statement + Ratios tabs; investor decks state Adjusted EBITDA ($4,154M Q4-2025, non-GAAP) [TSLA-Q4-2025 Update deck] | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | 10-Q cover page: Nasdaq-listed auto/energy manufacturer, Austin TX HQ, single consolidated registrant — operating company, not a financial institution, REIT, or disclosed HoldCo/OpCo structure | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y | 10-Q Note 8: RCF Credit Agreement, $5,000M committed, $0 drawn, maturity Jan-2028, not a borrowing-base facility (no borrowing-base language found); separately, an uncommitted Warehouse Agreement (up to a stated $ limit, secured by financing receivables) entered Q1 2026 | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N | Not disclosed anywhere in the pool — only the compliance affirmation exists | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | N / Not applicable | No HoldCo-level debt or structural-subordination disclosure found; Tesla, Inc. is the single consolidated registrant and debt issuer (China Working Capital Facility sits at a subsidiary level but is not flagged as structurally subordinated in the pool) | Structural subordination and upstreaming |
| Hedging / swaps disclosure | N | 10-Q explicitly states Tesla "do[es] not typically hedge foreign currency risk"; no interest-rate swap or hedge disclosure found in the debt note or market-risk section | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | N | Not disclosed in the data pool | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

All six cross-module files exist at `analyses/TSLA_2026-07-24/business-model/` and `analyses/TSLA_2026-07-24/earnings/`. Notably, `earnings/01_historical-financials.md` already computes a strict-basis net debt series (net cash shrinking from $8.7B in FY2021 to $1.8B in FY2025, flipping to $861M of net debt on a strict basis by Jun-30-2026, while the broad basis including short-term investments still shows ~$27.4B of net cash) — the balance-sheet-survival module's `01_capital-structure-and-leverage` agent should reconcile to this existing basis-labeled figure rather than recompute independently. `business-model/10_external-dependency.md` already flags automotive (~86.5% of FY2025 revenue) as "High" consumer-cycle exposure — this should calibrate the depth of the EBITDA stress haircut in `06_downside-stress-test`.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-Q cover page: registrant address Austin, Texas [Q2 FY26 10-Q, cover page] |
| Exchange | Nasdaq Global Select Market | 10-Q cover page: "The Nasdaq Global Select Market" [Q2 FY26 10-Q, cover page]; CIQ ticker NasdaqGS:TSLA throughout |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-Q filed "pursuant to Section 13 or 15(d) of the Securities Exchange Act of 1934" [Q2 FY26 10-Q, cover page]; 10-K/A filed under Form 10-K/A Amendment No. 1 |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | 10-Q references FASB ASU adoptions (ASU 2026-02, ASU 2025-05) and ASC topics (ASC 606, ASC 460) throughout Note disclosures [Q2 FY26 10-Q] |
| Reporting currency (USD / INR / …) | USD (with disclosed foreign-currency sub-exposures: CNY for the China Working Capital Facility, EUR/CNY operating exposure) | CIQ Capital Structure Details tab: "Repayment Currency" column shows USD for most instruments, CNY for the China Working Capital Facility; 10-Q FX-sensitivity note discloses euro/yuan exposure |
| Document language(s) | English (all documents) | Confirmed across every extract in `_pool_extracts/`; no non-English source in this pool |

Downstream agents should apply standard US-filing sourcing (10-Q/10-K, DEF 14A-style disclosures) — this is not a non-US jurisdiction case, so none of the India/other-market equivalence mapping in MODULE_RULES applies here.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N — instrument-level maturity data exists (10-Q Note 8 + CIQ Capital Structure Details), but it is NOT pre-aggregated into a by-year wall table; agent 02 must build it | 02, 06 | None (data present; no confidence cap needed beyond normal build effort) |
| No covenant disclosure | Y (partial) — a compliance affirmation exists but no threshold, ratio, or definition | 04, 06 | Covenant headroom = "Not assessable" (numeric headroom cannot be computed, only a binary "in compliance" statement); Overall usefulness max 75 |
| No cash flow statement | N — present (10-Q + CIQ) | 03, 04, 06 | None |
| No undrawn-facility disclosure | N — RCF $5.00B unused committed is explicitly disclosed | 03 | None |
| No interest-expense detail | N — covered via CIQ EBITDA/Interest ratio series; if the raw interest-expense dollar figure is needed and not separately itemized on the face of the income statement, proxy from the ratio series and flag | 04 | None (or minor: proxy flag only if raw $ not found on re-check) |
| No EBITDA base | N — present (CIQ + investor decks disclose Adjusted EBITDA; GAAP EBITDA constructible from CIQ Income Statement) | 06 | None |

Additional caps not in the standard six-row table above but directly supported by MODULE_RULES.md's fuller Score Cap Rules:

- **No covenant EBITDA definition / addback detail** → Covenant headroom max 60 (in addition to "Not assessable" if no threshold can be found at all).
- **Credit ratings present but thin** (single agency, S&P only; rating action dated Oct-2022, ~45 months stale) → note this explicitly to agent 99; do not infer an implied rating from the stale action date alone.
- **Hedging/swaps and change-of-control/cross-default/rating-trigger clauses undisclosed** → agent 05 (off-balance-sheet & contingencies) should state "Not disclosed in the data pool" per the module's Structural Priority & Entity Mapping hard rule, rather than assuming either a benign or adverse position.

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent balance sheet (10-Q as of Jun-30-2026, rolling forward the audited Dec-31-2025 balance sheet), a detailed debt note by instrument type/rate/maturity/seniority/security (10-Q Note 8 + CIQ Capital Structure Details), and a cash flow statement (10-Q + CIQ Cash Flow tabs) are all present and recent (the 10-Q was filed one day before this triage), so leverage, liquidity, coverage, and a stress test can all be built; the one real gap — no quantified covenant threshold/definition — is a bounded, flagged cap rather than a missing pillar.
- **Sections that can run:** capital structure, maturity wall (built from instrument-level data), liquidity, coverage (proxied where raw interest-expense $ is not directly itemized), contingencies, stress test. Covenant headroom runs but is capped to a binary compliance read, not a numeric headroom, per the flag above.
- **Active partial-data caps:**
  - Covenant headroom = "Not assessable" as a numeric distance-to-breach; only a binary "in material compliance" statement is available (10-Q, Note 8) — cap Overall usefulness at max 75, cap Covenant headroom score at max 60.
  - Credit-rating read is thin: one agency (S&P, BBB/Stable) with a rating action dated Oct-2022 — treat as directionally useful but stale; do not infer forward refinancing cost purely from this rating without flagging its age.
  - HoldCo/OpCo, hedging/swaps, and change-of-control/cross-default/rating-trigger clauses are all undisclosed in this pool — agent 05 must state "Not disclosed in the data pool" for each rather than assume a position.
- **Critical missing items:** None that block the module. The single biggest quality gap is the absence of any quantified covenant threshold or covenant-EBITDA addback definition anywhere in the pool.
- **Single highest-value missing document:** The credit agreement / indenture itself (or the original FY2025 Form 10-K's full debt note, which the 10-K/A in this pool explicitly does not carry) — either would supply the actual covenant thresholds and definitions that are currently only affirmed as "in compliance," without the numbers behind that affirmation.
