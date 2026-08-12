# Solvency Data Triage — DHER

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | Annual filing (IFRS, Germany) | FY2024 (filed 2025-04-25) | 2026-08-10 (sync date, not authoritative — period-end from inside doc) | High |
| Delivery_Hero_SE_-_Form_Annual_Report(Apr-25-2025).pdf | Annual filing (byte-identical duplicate of above per extraction) | FY2024 (filed 2025-04-25) | 2026-08-10 | High (duplicate — same content) |
| Delivery Hero SE, 2025 Earnings Call, Mar 26, 2026.pdf | Transcript (FY2025 results call) | FY2025 (call 2026-03-26) | 2026-08-10 | Medium |
| Delivery Hero SE, Q1 2026 Sales_ Trading Statement Call, Apr 30, 2026.pdf | Transcript (Q1 2026 trading update — no full interim balance sheet) | Q1 2026 (call 2026-04-30) | 2026-08-10 | Medium |
| Uber Technologies, Inc., Delivery Hero SE - M&A Call.pdf | Transcript — Uber/DHER acquisition call | 2026-07-16 | 2026-08-10 | High (pending change-of-control event; relevant to cross-default/CoC provisions) |
| Delivery Hero SE XTRA DHER Analyst Coverage.rtf | Analyst coverage list | As of pull date | 2026-08-10 | Low |
| Delivery Hero SE XTRA DHER Competitors.rtf | Competitor screen | As of pull date | 2026-08-10 | Low |
| Delivery Hero SE XTRA DHER Customers.rtf | Customer detail | As of pull date | 2026-08-10 | Low |
| Delivery Hero SE XTRA DHER Fixed Income Securities Summary.rtf | Fixed-income/bond registry (Capital IQ) | Bonds outstanding as of pull date | 2026-08-10 | High |
| Company Comparable Analysis Delivery Hero SE.xls | Multi-tab CIQ comp workbook | FY2023–FY2025 / LTM / As-of 2026-08-10 | 2026-08-10 | High (tabs below) |
| Delivery Hero SE XTRA DHER Financials.xls | Multi-tab CIQ financials workbook | FY2020–FY2025 (annual) | 2026-08-10 | High (tabs below) |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Multi-tab CIQ consensus/estimates workbook | Consensus/estimates, various as-of dates | 2026-08-10 | Medium (tabs below) |

### Workbook tabs (reconciled against `_pool_extracts/manifest.md`, 0 extraction failures across 28 tabs / 3 workbooks)

| Parent File | Tab | Rows×Cols | Solvency Relevance |
|---|---|---|---|
| Company Comparable Analysis Delivery Hero SE.xls | Financial Data | 50×17 | Medium — LTM net debt, EBITDA, EV |
| Company Comparable Analysis Delivery Hero SE.xls | Trading Multiples | 50×9 | Low |
| Company Comparable Analysis Delivery Hero SE.xls | Operating Statistics | 50×13 | Low |
| Company Comparable Analysis Delivery Hero SE.xls | Business Description | 44×3 | Low |
| Company Comparable Analysis Delivery Hero SE.xls | Implied Valuation | 69×9 | Low (valuation, out of module scope) |
| Company Comparable Analysis Delivery Hero SE.xls | Valuation Chart | 32×2 | Low |
| Company Comparable Analysis Delivery Hero SE.xls | Credit Health Panel | 48×10 | High — S&P Issuer Credit Rating "B" for DHER (Germany), peer credit-health quartiles |
| Company Comparable Analysis Delivery Hero SE.xls | Disclaimer | 26×1 | None |
| Delivery Hero SE XTRA DHER Financials.xls | Key Stats | 90×9 | Medium |
| Delivery Hero SE XTRA DHER Financials.xls | Income Statement | 112×7 | Medium — EBIT/EBITDA base |
| Delivery Hero SE XTRA DHER Financials.xls | Balance Sheet | 98×7 | High — cash, debt, equity by year FY2020–FY2025 |
| Delivery Hero SE XTRA DHER Financials.xls | Cash Flow | 76×7 | High — CFO, capex, FCF, cash interest paid, debt issued/repaid FY2020–FY2025 |
| Delivery Hero SE XTRA DHER Financials.xls | Multiples | 90×8 | Low |
| Delivery Hero SE XTRA DHER Financials.xls | Historical Capitalization | 39×7 | Medium |
| Delivery Hero SE XTRA DHER Financials.xls | Capital Structure Summary | 99×7 | High — debt by type, leverage ratios, 5-yr maturity buckets, undrawn revolver |
| Delivery Hero SE XTRA DHER Financials.xls | Capital Structure Details | 43×10 | High — instrument-level detail: coupon, maturity, seniority, secured/unsecured, convertible flag |
| Delivery Hero SE XTRA DHER Financials.xls | Ratios | 161×7 | Medium — coverage/leverage ratios |
| Delivery Hero SE XTRA DHER Financials.xls | Supplemental | 59×7 | Low |
| Delivery Hero SE XTRA DHER Financials.xls | Industry Specific | 15×6 | Low |
| Delivery Hero SE XTRA DHER Financials.xls | Pension OPEB | 110×7 | Medium — pension/OPEB funded status FY2020–FY2025 |
| Delivery Hero SE XTRA DHER Financials.xls | Segments | 64×7 | Low (business-model territory) |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Consensus | 534×31 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Recent Changes | 265×10 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Guidance | 55×13 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Multiples | 26×7 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Surprise | 262×28 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Trends | 411×16 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Revisions | 625×16 | Low |

No `external/` folder exists under `data/DHER/` — no externally sourced documents to inventory (Section 1A omitted).

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | FY2024 (period-end 2024-12-31; filed 2025-04-25) | ~20 months old vs report date 2026-08-12 |
| Quarterly filing | None (no interim financial-statements PDF in pool — only the Q1 2026 trading-update transcript, no balance sheet) | Q1 2026 trading update, call 2026-04-30 | ~3.4 |
| Debt / capital-structure export | Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Summary / Details tabs | FY2025 (period-end 2025-12-31; filing date used by CIQ 2026-03-26) | ~4.5 |
| Fixed-income / maturities export | Delivery Hero SE XTRA DHER Fixed Income Securities Summary.rtf | Bonds outstanding, pulled 2026-08-10 (implied) | Current |
| Cash flow statement | Delivery Hero SE XTRA DHER Financials.xls — Cash Flow tab | FY2025 (period-end 2025-12-31) | ~4.5 |
| Covenant / credit-agreement disclosure | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf, Note on RCF/Term Facilities (financial covenant, Group-level leverage test) | FY2024 (as of the FY2024 Annual Report) | ~20 |
| Credit rating report | Company Comparable Analysis Delivery Hero SE.xls — Credit Health Panel tab (S&P Issuer Credit Rating: B) | As-of 2026-08-10 | Current |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab, FY2025 (2025-12-31) | Debt, cash, equity base |
| Debt note (amounts by type) | Y | Financials.xls, Capital Structure Summary & Details tabs — term loans, senior bonds/notes (incl. convertibles), lease liabilities, revolver, by instrument with coupon/seniority/security | The debt stack and seniority |
| Maturity schedule | Y | Financials.xls, Capital Structure Summary tab (LT debt due +1 to +5 and after-5-yrs buckets) and Capital Structure Details tab (instrument-level maturity dates to 2030) | The maturity wall and refinancing exposure |
| Cash flow statement | Y | Financials.xls, Cash Flow tab, FY2020–FY2025, incl. cash interest paid, capex, debt issued/repaid | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y (partial — commitment amount known, borrowing-base/availability detail not disclosed in this pool) | Financials.xls, Capital Structure Summary tab — "Undrawn Revolving Credit" €461.8m (FY2025); RCF is unsecured per Capital Structure Details tab | True liquidity beyond cash |
| Interest expense detail | Y | Cash Flow tab (cash interest paid, FY2020–FY2025) and Capital Structure Details tab (per-instrument coupon/base rate) | Coverage ratios |
| Covenant disclosure | Y (partial — covenant exists and type is named, exact numeric threshold not located in extracted annual-report text) | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf — RCF/term-facility note states "a financial covenant... applied at Group level" and states compliance, but the extracted text does not carry the numeric threshold | Headroom to a breach |
| Lease detail (operating/finance) | Y | Financials.xls, Capital Structure Summary tab — Total Lease Liabilities €437.8m FY2025, cap-lease payment schedule to 5 yrs+ | Debt-like obligations |
| Pension / OPEB funded status | Y | Financials.xls, Pension OPEB tab, FY2020–FY2025 | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf — contingent liability of €440–770m disclosed re: an investigation; Spain freelance-rider-model litigation; bank guarantees to Spanish courts | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y | Company Comparable Analysis Delivery Hero SE.xls, Credit Health Panel tab — S&P Issuer Credit Rating (Foreign Currency LT): "B", Germany | Refinancing access and cost |
| EBITDA base (for stress test) | Y | Company Comparable Analysis Delivery Hero SE.xls, Financial Data tab (LTM/NTM EBITDA) and Financials.xls Income Statement tab (annual EBITDA FY2020–FY2025) | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Business Description tab + Annual Report — Delivery Hero SE is an online food-delivery/quick-commerce operating company (restaurant/quick-commerce classification per Credit Health Panel), not a bank/insurer/REIT | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y (partial) | Capital Structure Details tab — RCF: unsecured, Senior, floating (Benchmark), maturity 2028-05-01; commitment size and undrawn amount known (€461.8m undrawn FY2025); no borrowing-base/availability-reserve mechanic disclosed in this pool | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N | Not located in extracted annual-report text — Annual Report references "a financial covenant" and "Adjusted EBITDA" is defined elsewhere (income-statement footnote) but the specific covenant-EBITDA addback/cap language was not found in this pool | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | Partial | Annual Report notes RCF/term-facility covenant is applied "at Group level"; instrument-level guarantor/subsidiary structure (e.g. which entities guarantee the Dollar/KRW Term Facilities) not itemized in the extracted text | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Partial | Annual Report references a prepayment-related derivative recognized in net interest result (€23.7m) tied to the KRW Term Facility, but no comprehensive hedge-ratio table for the floating-rate book (Dollar/KRW Term Facilities) was located | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | Partial | Annual Report references "an infringement of such covenant" at Group level (cross-default-adjacent language); the pending Uber/DHER acquisition (M&A Call transcript, 2026-07-16) makes a change-of-control clause on the convertible bonds and term facilities directly relevant, but explicit CoC/rating-trigger clause text was not located in the extracted annual-report text | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Germany | Annual Report — "Delivery Hero SE," Berlin registered office; German Stock Corporation Act (AktG) references throughout governance sections |
| Exchange | Deutsche Börse XETRA (Frankfurt), ticker DHER | Ticker convention used throughout the CIQ workbooks: "Delivery Hero SE (XTRA:DHER)" |
| Filing regime | Other (Germany — EU/German Corporate Governance Code, AktG, Sections 289f/315d disclosure regime) | Annual Report — "German Corporate Governance Code (Deutscher Corporate Governance Kodex)," "Sections 289f, 315d" |
| Reporting standard | IFRS | Annual Report — "in accordance with IFRS," "Financial Statements in accordance with IFRS," IFRS 15 references |
| Reporting currency | EUR | All CIQ Financials.xls tabs and Annual Report figures stated in EUR millions |
| Document language(s) | English (Annual Report and Form Annual Report extracts are in English; company also publishes bilingually in German and English per governance disclosure — "available on the Company's website in German and English") | Annual Report, p. governance section: "publishes... in both German and English" |

No non-English documents were found in this pool requiring translation; both annual-report PDFs extracted are in English. Per CLAUDE.md §27, this is recorded as a fact, not treated as a gap either way.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N — maturity schedule is present (5-yr buckets + instrument-level maturity dates) | — | Not applied |
| No covenant disclosure | N (partial) — covenant existence and type disclosed, but the numeric threshold and covenant-EBITDA addback definition were not located in the extracted text | 04, 06 | Covenant headroom quality capped — treat as "Covenant headroom max 60" pending confirmation of the numeric threshold in the full annual-report note; do not assume market-standard terms without labeling the assumption |
| No cash flow statement | N — full annual CFO/FCF/capex/cash-interest series FY2020–FY2025 present | — | Not applied |
| No undrawn-facility disclosure | N — undrawn revolver amount disclosed (€461.8m FY2025); Y (partial) for borrowing-base/availability mechanics, which are not disclosed | 03 | Liquidity runway max 60 (revolver exists, commitment/undrawn known, but no borrowing-base/availability-reserve detail — per MODULE_RULES "Revolver exists but availability unknown") |
| No interest-expense detail | N — cash interest paid (annual series) and per-instrument coupon/base rate present | — | Not applied |
| No EBITDA base | N — LTM/NTM and annual EBITDA present in CIQ workbooks; earnings/01_historical-financials.md also available as cross-check | — | Not applied |

Additional cap not in the standard 6-row table but triggered by MODULE_RULES.md: **"Only annual data (no interim)"** — the pool contains no interim (Q1 2026 or H1 2026) balance sheet/cash-flow statement, only a trading-update transcript with no full financials. Applies: **Solvency strength max 75.**

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent (FY2025, period-end 2025-12-31) balance sheet, a detailed instrument-level debt note with maturities/seniority/security, and a full annual cash flow statement (with cash interest paid) are all present in the pool, so leverage, liquidity, coverage, and a stress test can all be built; the two gaps found (exact numeric covenant threshold/addback definition, and revolver borrowing-base mechanics) are narrow and each triggers its own MODULE_RULES cap rather than blocking the module.
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage/covenants (headroom directionally assessable but capped on quality — see caps), contingencies, stress test.
- **Active partial-data caps:**
  - Covenant headroom max 60 (numeric threshold and covenant-EBITDA addback definition not located in extracted text — 04, 06 must state the covenant type from the filing and flag the missing numeric threshold rather than assume one).
  - Liquidity runway max 60 (RCF commitment and undrawn amount are known, but borrowing-base/availability-reserve mechanics are not disclosed — 03 must treat the RCF as "committed, undrawn amount known, availability mechanics unknown").
  - Solvency strength max 75 (only annual data in the pool; no interim balance sheet — the Q1 2026 call is a trading update, not a financial statement).
- **Critical missing items:**
  - Exact numeric covenant threshold(s) for the RCF/term-facility financial covenant (the Annual Report names the covenant's existence and states compliance, but the specific ratio/level was not found in the extracted text).
  - Guarantor/subsidiary-level detail for the Dollar Term Facility and KRW Term Facility (both secured, non-EUR-denominated) — HoldCo/OpCo and structural-subordination mapping should note this as a labeled gap, not assume upstreaming is unconstrained.
  - Interim (Q1/H1 2026) balance sheet and cash flow statement — only a trading-update transcript exists for the period since FY2025 year-end.
- **Single highest-value missing document:** The FY2025 (calendar year 2025, filed ~2026-03-26) Annual Report's full text with the RCF/term-facility covenant note and numeric threshold — the pool's Capital Structure tabs already carry FY2025 balance-sheet and debt data (CIQ "Source: A 2025 filed Mar-26-2026"), but the actual FY2025 Annual Report PDF (as opposed to the FY2024 PDF in the pool) is not present, so the covenant note, contingent-liability update, and guarantor detail for FY2025 cannot be read from a primary filing — only inferred from the FY2024 Annual Report and the CIQ workbook roll-forward. Downstream agents should treat FY2025-specific covenant/contingency narrative as sourced from CIQ tabs and the FY2025 earnings call transcript, not from an audited FY2025 annual-report text, and should flag this distinction wherever it matters.
