# Solvency Data Triage — NHY

## 1. File Inventory

Multi-tab workbooks were pre-extracted via `.claude/tools/extract_pool.py` (already fresh in this run: 5 workbooks → 36 tabs, 45 extract files, 0 failures — see `_pool_extracts/manifest.md` / `manifest.json`). No `ciq_facts.json` sidecar exists in `_pool_extracts/`, so every Capital IQ figure below is read directly from the workbook tab extracts, not from a pinned facts file. No `data/NHY/external/` directory exists — no external documents to inventory (Section 1A below is empty by inventory, not by omission).

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| integrated-annual-report-2025.pdf | Annual filing (Norwegian statutory Integrated Annual Report, IFRS-EU) | FY2025 (year ended 31-Dec-2025) | 2026-07-18 (Drive sync date, not filing date; report approved 13-Feb-2026 per filing-date fields inside the CIQ workbook) | High — carries the debt notes (7.1 Capital management, 7.4 Short and long-term debt), Note 8.1 Financial and commercial risk management (interest-rate, credit, liquidity risk, contractual-obligations ladder), Note 4.1 (provisions & contingent liabilities), Note 11 (Guarantees), pension notes, and credit-rating disclosure |
| first-quarter-report-2026.pdf | Quarterly filing (Board-approved Quarterly Report, Oslo Børs continuing-obligations equivalent of a 10-Q/6-K) | Q1 2026 (ended 31-Mar-2026), Board-approved 28-Apr-2026 | 2026-07-18 | High — latest consolidated balance sheet and cash flow statement |
| Norsk Hydro ASA, Q1 2026 Earnings Call, Apr 29, 2026.pdf | Earnings transcript (verbatim, CIQ/S&P Global Market Intelligence) | FQ1 2026 call, 29-Apr-2026 | 2026-07-18 | Medium — management commentary on refinancing, ratings, and liquidity |
| Norsk Hydro ASA, Q4 2025 Earnings Call, Feb 13, 2026.pdf | Earnings transcript (verbatim) | FQ4 2025 / FY2025 call, 13-Feb-2026 | 2026-07-18 | Medium |
| nhy-presentation-q1-2026.pdf | Investor deck | Q1 2026, presented 29-Apr-2026 | 2026-07-18 | Low-Medium — headline figures only, not a primary debt source |
| nhy-investor-day-2025.pdf | Investor deck (strategy) | Investor Day, London, 27-Nov-2025 | 2026-07-18 | Low — capital-structure targets/ambition language, not primary debt detail |
| NorskHydroASAOBNHY_PublicCompany.pdf | Data export (Capital IQ company profile) | TTM through Mar-31-2026A + FY2026E/27E | 2026-07-18 | Medium — includes S&P/Moody's rating snapshot |
| Norsk Hydro ASA OB NHY Board Members.rtf | Data export (Capital IQ governance) | Current | 2026-07-18 | Low (out of solvency scope) |
| Norsk Hydro ASA OB NHY Customers.rtf | Data export (Capital IQ relationships) | Trailing 2 years | 2026-07-18 | Low (out of solvency scope) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Financial Data | Data export (tab) | Multi-year, comparable set | 2026-07-18 | Low (peer comp) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Trading Multiples | Data export (tab) | Current | 2026-07-18 | Low (peer comp) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Operating Statistics | Data export (tab) | Current | 2026-07-18 | Low (peer comp) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Business Description | Data export (tab) | Descriptive | 2026-07-18 | Low |
| Company Comparable Analysis Norsk Hydro ASA.xls — Implied Valuation | Data export (tab) | Current | 2026-07-18 | Low (valuation, out of module scope) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Valuation Chart | Data export (tab) | Current | 2026-07-18 | Low |
| Company Comparable Analysis Norsk Hydro ASA.xls — Credit Health Panel | Data export (tab) | As-of 2026-07-18 | 2026-07-18 | High — peer-relative Overall/Operational/Solvency/Liquidity credit scores + S&P LT issuer rating for NHY and 10 peers |
| Company Comparable Analysis Norsk Hydro ASA.xls — Disclaimer | Data export (tab) | n/a | 2026-07-18 | None |
| Norsk Hydro ASA OB NHY Financials.xls — Key Stats | Data export (tab) | FY2022-FY2025A + LTM Mar-2026 + FY2026-28E | 2026-07-18 | Medium |
| Norsk Hydro ASA OB NHY Financials.xls — Income Statement | Data export (tab) | FY2021-FY2025A + LTM | 2026-07-18 | Medium (EBITDA base for coverage/leverage) |
| Norsk Hydro ASA OB NHY Financials.xls — Balance Sheet | Data export (tab) | FY2021-FY2025A + Q1 2026 | 2026-07-18 | High — debt, cash, equity, pension liability lines |
| Norsk Hydro ASA OB NHY Financials.xls — Cash Flow | Data export (tab) | FY2021-FY2025A + LTM Mar-2026 | 2026-07-18 | High — CFO, capex, debt issued/repaid, dividends, cash interest paid, levered/unlevered FCF |
| Norsk Hydro ASA OB NHY Financials.xls — Multiples | Data export (tab) | Annual | 2026-07-18 | Low |
| Norsk Hydro ASA OB NHY Financials.xls — Historical Capitalization | Data export (tab) | Quarterly, Dec-2024 to Mar-2026 | 2026-07-18 | Medium — market cap, TEV, debt/equity build |
| Norsk Hydro ASA OB NHY Financials.xls — Capital Structure Summary | Data export (tab) | FY2024, FY2025, Q1 2026 | 2026-07-18 | High — total debt, undrawn revolver, net debt, leverage ratios, 5-year fixed payment schedule, contractual-obligations ladder |
| Norsk Hydro ASA OB NHY Financials.xls — Capital Structure Details | Data export (tab) | FY2025 and FY2024 "as reported" | 2026-07-18 | High — instrument-level debt detail: type, coupon/floating rate, maturity, seniority, secured/unsecured, repayment currency |
| Norsk Hydro ASA OB NHY Financials.xls — Ratios | Data export (tab) | Annual history | 2026-07-18 | Medium |
| Norsk Hydro ASA OB NHY Financials.xls — Supplemental | Data export (tab) | Annual | 2026-07-18 | Low |
| Norsk Hydro ASA OB NHY Financials.xls — Industry Specific | Data export (tab) | Annual | 2026-07-18 | Low |
| Norsk Hydro ASA OB NHY Financials.xls — Pension OPEB | Data export (tab) | FY2020-FY2025 | 2026-07-18 | Medium — defined-benefit obligation, plan assets, funded status |
| Norsk Hydro ASA OB NHY Financials.xls — Segments | Data export (tab) | FY2020-FY2025 | 2026-07-18 | Low (asset-sale/liquidity-lever context, not solvency-primary) |
| Norsk Hydro ASA OB NHY Products.xls — Products | Data export (tab) | Current | 2026-07-18 | Low (out of solvency scope) |
| NorskHydroASAOBNHYEstimatesReport.xls — Consensus | Data export (tab) | As of Apr-29-2026 | 2026-07-18 | Low (out of solvency scope) |
| NorskHydroASAOBNHYEstimatesReport.xls — Recent Changes | Data export (tab) | Rolling | 2026-07-18 | Low |
| NorskHydroASAOBNHYEstimatesReport.xls — Guidance | Data export (tab) | FQ2 2008-FY2030 | 2026-07-18 | Low (capex guidance context only) |
| NorskHydroASAOBNHYEstimatesReport.xls — Multiples | Data export (tab) | Current | 2026-07-18 | Low |
| NorskHydroASAOBNHYEstimatesReport.xls — Surprise | Data export (tab) | Multi-quarter history | 2026-07-18 | Low |
| NorskHydroASAOBNHYEstimatesReport.xls — Trends | Data export (tab) | FQ2 2026-FY2029 | 2026-07-18 | Low |
| NorskHydroASAOBNHYEstimatesReport.xls — Revisions | Data export (tab) | FQ2 2026-FY2029 | 2026-07-18 | Low |
| NorskHydroASAOBNHYEstimatesReport (1).xls — Consensus/Recent Changes/Guidance/Multiples/Surprise/Trends/Revisions (7 tabs) | Data export (second export/refresh, not byte-identical but tab-for-tab structurally identical) | Same as above | 2026-07-18 | Low — treat as one source with the non-"(1)" file, not a corroborating independent vintage |

## 1A. External Data

No `data/NHY/external/` directory exists in the pool. No external documents (alt-data panels, expert calls, channel checks, broker research, paid-API pulls) are present. This has no effect on the sufficiency verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | integrated-annual-report-2025.pdf | FY2025 (ended 31-Dec-2025), approved 13-Feb-2026 | ~6.6 since period-end |
| Quarterly filing | first-quarter-report-2026.pdf | Q1 2026 (ended 31-Mar-2026), Board-approved 28-Apr-2026 | ~3.6 since period-end |
| Debt / capital-structure export | Norsk Hydro ASA OB NHY Financials.xls — Capital Structure Details / Summary tabs | FY2025 "as reported" (source: "A 2025 filed Feb-13-2026"), plus Q1 2026 snapshot | ~3.6-6.6 |
| Fixed-income / maturities export | Norsk Hydro ASA OB NHY Financials.xls — Capital Structure Summary tab (5-yr fixed payment schedule); integrated-annual-report-2025.pdf, Note 8.1 (contractual-obligations ladder to 2030+) | FY2025 | ~6.6 |
| Cash flow statement | Norsk Hydro ASA OB NHY Financials.xls — Cash Flow tab (FY2021-2025A + LTM Mar-2026); first-quarter-report-2026.pdf (Q1 2026 statement) | LTM through Mar-2026 | ~3.6 |
| Covenant / credit-agreement disclosure | integrated-annual-report-2025.pdf, Note 7.4 ("majority of long-term loans are held by the parent company. There are no financial covenants for those loans. Some loans held by part-owned subsidiaries have financial covenants as part of the terms.") | FY2025 | ~6.6 |
| Credit rating report | integrated-annual-report-2025.pdf (S&P Global BBB stable / Moody's Baa2 stable, disclosed inline, not a standalone rating-agency report); Company Comparable Analysis Norsk Hydro ASA.xls — Credit Health Panel tab (S&P LT issuer rating snapshot, as-of 2026-07-18) | FY2025 / current | ~6.6 (filing) / current (CIQ panel) |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | Q1 2026 consolidated balance sheet [first-quarter-report-2026.pdf]; FY2025 [integrated-annual-report-2025.pdf]; FY2021-2025A+Q1 2026 [Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab] | Debt, cash, equity base |
| Debt note (amounts by type) | Y | Note 7.4 Short and long-term debt (unsecured loans NOK 31,721m, other loans NOK 445m, lease liabilities NOK 4,305m, bank loans/overdrafts NOK 103m FY2025) [integrated-annual-report-2025.pdf, p.181-182]; instrument-level detail by type/coupon/seniority/secured [Capital Structure Details tab] | The debt stack and seniority |
| Maturity schedule | Y | Contractual-obligations table by year 2026-2030+ (long-term debt incl. interest) [integrated-annual-report-2025.pdf, Note 8.1, p.187]; "long-term debt that falls due after 2030 amounted to NOK 11,824 million" [p.~204]; 5-year fixed payment schedule (Due +1 through +5, After 5 Yrs) [Capital Structure Summary tab] | The maturity wall and refinancing exposure |
| Cash flow statement | Y | CFO, capex, debt issued/repaid, dividends, cash interest paid, levered/unlevered FCF, FY2021-2025A + LTM Mar-2026 [Norsk Hydro ASA OB NHY Financials.xls, Cash Flow tab]; Q1 2026 statement [first-quarter-report-2026.pdf] | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | "two syndicated revolving credit facilities, USD 1,600 million maturing in November 2030 and USD 800 million maturing in November 2027... Both facilities were undrawn per year-end 2025" [integrated-annual-report-2025.pdf, p.179]; "Undrawn Revolving Credit 24,193.656" (NOK m, FY2025) [Capital Structure Summary tab] — no borrowing-base language found, so this reads as a committed (not borrowing-base) facility | True liquidity beyond cash |
| Interest expense detail | Y | Cash Interest Paid NOK 2,358m (FY2025/LTM) [Cash Flow tab]; Note 7.5 Finance income and expense referenced [integrated-annual-report-2025.pdf, p.182] | Coverage ratios |
| Covenant disclosure | Partial | "There are no financial covenants for [parent-company long-term] loans. Some loans held by part-owned subsidiaries have financial covenants as part of the terms" [integrated-annual-report-2025.pdf, Note 7.4, p.182] — directional statement only; no covenant thresholds, definitions, or headroom numbers disclosed for the subsidiary loans that do carry covenants | Headroom to a breach |
| Lease detail (operating/finance) | Y | Lease Liabilities NOK 4,305m (FY2025) / NOK 4,669m (FY2024), classified Capital Lease/Secured [Capital Structure Details tab]; Long-Term Leases line on balance sheet [Balance Sheet tab] | Debt-like obligations |
| Pension / OPEB funded status | Y | Defined-benefit obligation NOK 18,169m, plan assets NOK 20,861m FY2025 (over-funded on a DBO basis) [Pension OPEB tab]; Pension & Other Post-Retire. Benefits NOK 9,438m on balance sheet (gross/unfunded portions by jurisdiction) [Balance Sheet tab]; Net pension asset (obligation) at fair value shown in Adjusted net debt bridge [integrated-annual-report-2025.pdf, p.180] | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | Note 4.1 Uncertain assets and liabilities / Contingent liabilities and contingent assets — Brazil tax cases "known cases amount to about NOK 4.3 billion, of which losses are considered possible in cases amounting to about NOK 3.6 billion"; Alunorte litigation (uncertain, unquantified); Note 11 Guarantees "Total guarantees not recognized NOK 2,952m FY2025 / NOK 3,073m FY2024" [integrated-annual-report-2025.pdf, p.171-172, 198] | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y | "S&P Global (current rating BBB, stable outlook) and Moody's (current rating Baa2, stable outlook)" [integrated-annual-report-2025.pdf, p.178-179, 3020-3021]; S&P LT issuer rating BBB reconfirmed in peer panel [Company Comparable Analysis Norsk Hydro ASA.xls, Credit Health Panel tab, as-of 2026-07-18] | Refinancing access and cost |
| EBITDA base (for stress test) | Y | Adjusted EBITDA NOK 28,889m (2025) / NOK 26,318m (2024) [integrated-annual-report-2025.pdf, p.180]; reported EBITDA derivable from Income Statement + D&A tabs [Norsk Hydro ASA OB NHY Financials.xls]; segment EBITDA FY2020-2025 [Segments tab] | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Operating company — integrated aluminium producer (bauxite/alumina, energy, aluminium metal, metal markets, extrusions); not a bank, insurer, or REIT. Debt is issued centrally: "the majority of long-term loans are held by the parent company" [integrated-annual-report-2025.pdf, Note 7.4, p.182] — a centralized-treasury structure, not a HoldCo/OpCo structural-subordination pattern | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y | Two syndicated multicurrency RCFs, USD 1,600m (matures Nov-2030) and USD 800m (matures Nov-2027), refinanced in 2025 "as sustainability linked loans," both undrawn at FY2025-end, both usable as swingline sub-facilities [integrated-annual-report-2025.pdf, p.179, 3799]; no borrowing-base mechanism disclosed — commitment amount = availability | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N | No covenant-EBITDA definition, addback list, or addback cap disclosed anywhere in the pool — consistent with the parent-company loans (the bulk of long-term debt) carrying no financial covenants at all; the subsidiary-level covenants referenced in Note 7.4 are not defined | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | N/A (gate: not applicable) | Norsk Hydro ASA is the single listed parent; debt is centrally issued at the parent level per Note 7.4, and equity/loan funding of subsidiaries is on an arm's-length, ownership-proportional basis [integrated-annual-report-2025.pdf, p.179] — no structural-subordination pattern to map | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Y | Cash-flow hedges for Alunorte/Albras Brazil currency exposure; "the bonds pay a mix of floating short-term interest and long-term fixed interest... strategy is to keep a mix of floating and fixed interest exposures on the debt" [integrated-annual-report-2025.pdf, Note 8.1, p.187]; Fixed Rate Debt NOK 7,440m vs Variable Rate Debt NOK 1,500m (FY2025) [Capital Structure Summary tab] | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | N | Not disclosed anywhere in the pool — no change-of-control put, cross-default, or rating-linked pricing-step language found in the annual report, quarterly report, or CIQ exports | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

Both the business-model module (all 12 numbered agents + `99_business-model-synthesis.md`) and the earnings module (all 8 numbered agents + `99_earnings-synthesis.md`) have completed for NHY. Downstream balance-sheet-survival agents can read cyclicality/commodity-exposure calibration, capital-allocation/leverage-trajectory context, the segment/asset base, and the EBITDA/CFO/FCF/margin trend directly from these completed modules rather than re-deriving them from the raw pool.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Norway | "traded on the Oslo Stock Exchange (OSE) during 2025" [integrated-annual-report-2025.pdf, p.2972]; incorporated 1905 in NO [Capital IQ Public Company profile] |
| Exchange | Oslo Børs (OB:NHY); ADR also trades OTC in the US (OTCPK:NHYD.Y) | [NorskHydroASAOBNHYEstimatesReport.xls, Trends tab header] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | Other — Norwegian statutory reporting under Oslo Børs continuing obligations / the Norwegian Accounting Act; no US SEC or India SEBI-LODR filings apply | "prepared in accordance with the Norwegian Accounting Act" [integrated-annual-report-2025.pdf]; "approved by the Board of Directors on 28 April 2026" [first-quarter-report-2026.pdf, p.1] |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS Accounting Standards as adopted by the EU (consolidated); parent-company standalone accounts under the Norwegian Accounting Act | "consolidated financial statements... prepared in accordance with IFRS® Accounting Standards as adopted by the EU" [integrated-annual-report-2025.pdf] |
| Reporting currency (USD / INR / …) | NOK (Norwegian krone), millions; fiscal year ends 31 December | "Amounts in NOK million" throughout all notes; FY2025 = year ended 31-Dec-2025 |
| Document language(s) | English (every filing, deck, transcript, and Capital IQ export in this pool is in English; no non-English source documents found) | Direct reading of all files in `_pool_extracts/` |

Downstream agents in this module should read the Norwegian statutory Integrated Annual Report (Board's Report + audited IFRS-EU consolidated financial statements + Notes, especially Note 7.1/7.4/8.1/4.1/11) as the Tier-1 debt/contingency/covenant/rating source, and the Board-approved Quarterly Report as the Tier-2 interim source, per CLAUDE.md §27 and MODULE_RULES.md's Jurisdiction-Aware Sourcing section. No US indenture or Moody's/S&P/Fitch "report" document exists as a standalone file, but the ratings themselves (S&P BBB stable, Moody's Baa2 stable) are disclosed directly inside the audited annual report — this is not a data gap; a standalone third-party rating-rationale PDF is simply not in the pool. State all figures in NOK; do not convert without stating the FX date/rate (none required here since the reporting currency is used throughout).

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N | 02, 06 | Not applicable — a year-by-year contractual-obligations ladder (2026-2030+) and a 5-year fixed payment schedule are both disclosed |
| No covenant disclosure | Y (partial) | 04, 06 | The parent-company loans (majority of long-term debt) carry no financial covenants — genuinely low covenant risk, not a gap. But the subsidiary-level loans that DO carry covenants have no disclosed threshold, definition, or headroom — covenant headroom for that slice is "Not assessable"; per Score Cap Rules, Overall usefulness capped at max 75 for that portion, and Covenant headroom score should reflect the "quality unknown" status for the subsidiary-covenant debt specifically (the parent debt itself is not covenant-constrained) |
| No cash flow statement | N | 03, 04, 06 | Not applicable — full annual (FY2021-2025A + LTM Mar-2026) and Q1 2026 cash flow statements are present, including cash interest paid |
| No undrawn-facility disclosure | N | 03 | Not applicable — both RCFs' full commitment amounts (USD 1,600m + USD 800m) are disclosed as fully undrawn at FY2025-end, with no borrowing-base mechanism, so the full commitment counts as availability |
| No interest-expense detail | N | 04 | Not applicable — Cash Interest Paid (NOK 2,358m FY2025/LTM) is disclosed directly in the Cash Flow tab |
| No EBITDA base | N | 06 | Not applicable — Adjusted EBITDA (NOK 28,889m FY2025) is disclosed in Note 7.1, and reported EBITDA/segment EBITDA are derivable from the Income Statement and Segments tabs |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a recent audited annual filing (FY2025 Integrated Annual Report, IFRS-EU, ~6.6 months old) with instrument-level debt notes, a year-by-year maturity/contractual-obligations ladder, a full cash flow statement (annual and Q1 2026), disclosed committed-and-undrawn revolving facilities, disclosed credit ratings (S&P BBB / Moody's Baa2), a quantified contingent-liabilities note (Brazil tax cases, Alunorte litigation, guarantees), and an EBITDA base for the stress test — clearing all three legs of the Sufficient rule (balance sheet + debt note + cash flow statement).
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage/covenants (with a partial-data flag on the subsidiary-level covenant slice only), contingencies, stress test.
- **Active partial-data caps:** None hard-triggered at the module level. One targeted note: covenant headroom for the (undisclosed-threshold) subsidiary-level covenant debt is "Not assessable" and should be labeled as such by `04_coverage-and-covenants`; this does not cap the parent-level (majority) debt, which is affirmatively disclosed as covenant-free.
- **Critical missing items:** No standalone third-party rating-agency rationale document (the ratings themselves are disclosed inline in the audited filing, so this is a minor completeness gap, not a sufficiency gap). No change-of-control / cross-default / rating-trigger language found anywhere in the pool — flag as "Not disclosed in the data pool" per MODULE_RULES.md's Structural Priority & Entity Mapping hard rule, rather than assuming absence of such clauses.
- **Single highest-value missing document:** The underlying bond-trust-deed / RCF credit-agreement covenant package for the subsidiary-level loans referenced in Note 7.4 — this would convert the currently un-quantifiable "some loans held by part-owned subsidiaries have financial covenants" disclosure into an actual headroom calculation.
