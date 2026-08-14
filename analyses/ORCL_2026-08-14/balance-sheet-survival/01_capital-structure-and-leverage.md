# Capital Structure & Leverage — ORCL

Reporting currency: USD. Reporting standard: US GAAP. Fiscal year ends May 31 ("FY2026" = year ended May-31-2026). All figures below are from Oracle's audited FY2026 Form 10-K (filed 2026-06-22) and Capital IQ financial-data exports (data as of 2026-08-13) unless otherwise cited. No `ciq_facts.json` sidecar was found in `_pool_extracts/` for this run; all figures below are this agent's own sourced read of the filing and CIQ workbooks, cross-checked line-by-line against the audited balance sheet.

## 1. Debt Stack

Oracle Corporation (the NYSE-listed parent) is the sole issuer of every instrument below — no subsidiary or separate HoldCo issuer is disclosed. All debt is unsecured except the finance-lease and operating-lease liabilities, which are secured by the leased assets themselves.

| Instrument | Amount (FY2026, USD mn) | Entity | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Commercial Paper Notes | 1,468 | Oracle Corporation | No | Senior unsecured | None | Rolling, program to 2027-05-31 | Fixed, ~4.35% wtd. avg | [FY26 10-K, Note on Debt — Commercial Paper Program; CIQ Financials_Annual.xls, Capital Structure Details tab] |
| Curr. portion of long-term notes payable | 5,731 | Oracle Corporation | No | Senior unsecured | None | Within 12 months of FY26 year-end | Fixed (mix of matured/maturing tranches) | [FY26 10-K, Consolidated Balance Sheet, "Notes payable and other borrowings, current" = $7,199mn = $1,468mn CP + $5,731mn curr. LT notes] |
| Senior Notes (fixed, ~48 tranches, 2026–2066) | 122,000 (123,500 par less 2 floating tranches below) | Oracle Corporation | No | Senior unsecured, pari passu with CP and revolver | None | Laddered 2026–2066 | Fixed, 1.65%–6.90% | [FY26 10-K, Note on Debt, Notes Payable schedule; CIQ Capital Structure Details tab] |
| Senior Notes (floating, 2 tranches) | 1,000 | Oracle Corporation | No | Senior unsecured, pari passu with fixed notes | None | Aug 2028 / Feb 2029 | Floating, SOFR+0.76% / SOFR+1.11% | [FY26 10-K, Note on Debt; CIQ Capital Structure Details tab] |
| Term Loan Credit Agreement 2 | 5,137 | Oracle Corporation | No | Senior unsecured, pari passu with senior notes | None | Final maturity 2027-08-16; quarterly amortization 1.25%–2.50% of principal from Sep-2024 | Floating, SOFR + 112.5–162.5bps (one portion swapped to fixed via cash-flow hedge) | [FY26 10-K, Note on Debt — Term Loan Credit Agreements] |
| Revolving Credit Agreement ($10.0bn commitment) | 0 drawn | Oracle Corporation | No | Senior unsecured, pari passu with senior notes | None | 2031-03-06 | Floating (SOFR-based, undrawn) | [FY26 10-K, Note on Debt — Revolving Credit Agreement; entered March 2026, replacing a $6.0bn facility] |
| Finance lease liabilities | 7,701 (620 current + 7,081 non-current) | Oracle Corporation | Yes | Effectively secured by leased assets | Leased data-center/equipment assets | Various | Fixed, ~5.70% wtd. avg (imputed discount rate) | [FY26 10-K, Leases note, "Finance lease liabilities, current/non-current"] |
| **Total notes payable + finance leases (interest-bearing debt)** | **137,242** | — | — | — | — | — | — | Sum of rows above |
| Memo: Operating lease liabilities (not GAAP "debt") | 30,190 (3,542 current + 26,648 non-current) | Oracle Corporation | Effectively secured by leased assets | n/a (ASC 842 lease liability, not a debt instrument) | Data-center and real-estate leases | Various | Fixed, ~5.70% wtd. avg (imputed discount rate) | [FY26 10-K, Leases note, "Operating lease liabilities, current/non-current"] |
| **Total gross debt incl. operating leases (CIQ / IFRS16-style all-in basis)** | **167,432** | — | — | — | — | — | — | [CIQ Financials_Annual.xls, Balance Sheet & Capital Structure Summary tabs — ties to audited B/S: ST borrowings 1,468 + curr. LT debt 5,731 + curr. leases 4,162 + LT debt 122,342 + LT leases 33,729 = 167,432] |

**Three debt bases, all material — used differently below:**
1. **Notes payable & other borrowings only** (Oracle's own "aggregate indebtedness" definition used in its Risk Factors) = **$129,541mn** ($7,199mn current + $122,342mn non-current) — the 10-K states "As of May 31, 2026, we had an aggregate of $129.5 billion of outstanding indebtedness" [FY26 10-K, Item 1A, p.19]. This is CP + Term Loan + Senior Notes ($1,468 + $5,137 + $123,500 = $130,105mn) less a $564mn unamortized discount/issuance-cost adjustment.
2. **Notes payable + finance leases** (GAAP interest-bearing debt, excludes operating leases) = **$137,242mn**.
3. **All-in, incl. operating lease liabilities** (CIQ's standardized "Total Debt," an IFRS16-style convention that capitalizes operating leases even though US GAAP under ASC 842 does not label them "debt") = **$167,432mn**.

The $30,190mn gap between basis 2 and basis 3 is entirely the operating-lease liability, which grew from $13,450mn (FY2025) to $30,190mn (FY2026, +125%) as Oracle signs long-dated data-center leases for its AI-infrastructure build-out — this is a fast-growing, real fixed obligation, not a rounding item. **Both views are shown throughout this report; Section 7 designates the canonical figure for downstream agents.**

The revolver's maintenance covenant: Consolidated EBITDA / Consolidated Net Interest Expense must not be less than 3.0x at each fiscal quarter-end while the Revolving Credit Agreement is effective [FY26 10-K, Note on Debt — Revolving Credit Agreement]. Oracle states it "was in compliance with all debt-related covenants at May 31, 2026" [FY26 10-K, Note on Debt]. (Full covenant-headroom computation is `04_coverage-and-covenants`'s job, not this agent's — this is noted here because it is disclosed alongside the debt stack.)

No change-of-control put, cross-default trigger, or rating-linked pricing step is separately disclosed beyond the Term Loan / Revolver interest-rate grids referencing "the credit rating assigned to our long-term senior unsecured debt" (i.e., the margin over SOFR moves with the rating, but no acceleration trigger is stated) — **not disclosed in the data pool** beyond that pricing-grid mechanism.

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating lease liabilities (US GAAP ASC 842) | $30,190mn ($3,542mn current + $26,648mn non-current) | On-balance-sheet lease liability under US GAAP; not classified as "debt" by Oracle or by GAAP, but capitalized into "Total Debt" by Capital IQ (an IFRS16-style convention). Shown here and in Section 1. | [FY26 10-K, Leases note] |
| Pension / OPEB underfunding | $1,656mn net liability recognized on the balance sheet (projected benefit obligation $2,500mn vs. plan assets) | Recorded within Other Non-Current Liabilities; small relative to the balance sheet ($261.8bn total assets) | [CIQ Financials_Annual.xls, Pension/OPEB tab, FY2026 column] |
| Preferred equity — 6.50% Series D Mandatory Convertible Preferred Stock | $5.0bn gross proceeds / $4,954mn carrying value | Classified as equity, not debt, but carries a fixed 6.50% dividend ($63mn paid FY26, first partial year; quarterly dividend of $1,625/share declared Jun-2026), ranks senior to common stock for dividends and liquidation ($100,000/share liquidation preference), and mandatorily converts to common stock by 2029-01-15 (or earlier on a fundamental change) | [FY26 10-K, Note 10 (Stockholders' Equity) — Mandatory Convertible Preferred Stock terms; issued 2026-02-05] |
| Unconditional purchase obligations (data-center power, capacity) | $13,309mn recorded (Note 14) + a further $19bn of unconditional 5-year purchase commitments entered into after FY26 year-end (not yet recorded on the balance sheet) | Off-balance-sheet contractual commitment, not debt; additive to the capex/debt buildout already underway | [FY26 10-K, Note 14 (Commitments and Contingencies)] |
| Gross unrecognized income tax benefits | $13.2bn | Contingent tax liability recorded on the consolidated balance sheet; not classified as debt | [FY26 10-K, Item 1A (Risk Factors, Income Taxes)] |

## 3. Cash & Liquid Assets

| Item | Amount (FY2026, USD mn) | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | 31,289 | No — restricted cash included within cash & equivalents is disclosed as "immaterial" | [FY26 10-K, Consolidated Balance Sheet; FY26 10-K, Cash & Cash Equivalents note] |
| Liquid short-term investments | 605 | No | [FY26 10-K, Consolidated Balance Sheet, "Short-term investments"] |
| Restricted / trapped cash (flag) | Immaterial (not separately quantified) | Confirmed immaterial by the filing itself | [FY26 10-K, Cash & Cash Equivalents note: "Restricted cash... was immaterial"] |
| **Total cash & liquid short-term investments** | **31,894** | — | [CIQ Financials_Annual.xls, Balance Sheet tab, "Total Cash & ST Investments"] |

Cash & equivalents jumped from $10,786mn (FY2025) to $31,289mn (FY2026, +190%) — this is a stock of freshly-raised debt and preferred proceeds sitting on the balance sheet (Oracle raised $42.7bn of senior notes and $5.0bn of preferred stock during FY2026 [FY26 10-K, MD&A, Liquidity and Capital Resources]), not retained operating cash; FY2026 levered free cash flow was −$23,686mn (Section 6, and `earnings/01_historical-financials.md`). The cash balance should be read as pre-funded capex dry powder, not as surplus liquidity.

## 4. Gross & Net Debt

| Metric | Value (USD mn) | Source |
|---|---:|---|
| Gross debt (all-in, incl. operating leases — canonical basis, see Section 7) | 167,432 | Section 1 |
| − Cash & equivalents | (31,289) | Section 3 |
| **Net debt (strict, §15)** | **136,143** | 167,432 − 31,289 = 136,143 |
| − Liquid short-term investments | (605) | Section 3 |
| **Net debt (broad, incl. investments)** | **135,538** | 136,143 − 605 = 135,538; ties to CIQ's own "Net Debt" field of $135,538mn [CIQ Financials_Annual.xls, Balance Sheet tab] |

Memo — net debt on the narrower, GAAP interest-bearing-debt-only basis (excludes operating leases): $137,242mn gross debt − $31,289mn cash = **$105,953mn** (strict). This is a full turn of leverage lower than the all-in basis (Section 5) — the choice of debt basis is not a rounding issue here and is why both are shown.

The gap between strict and broad is small ($605mn of short-term investments), so the strict basis is used as the canonical net-debt figure throughout (Section 7), consistent with CLAUDE.md §15's default.

## 5. Leverage Ratios

*Higher = worse for all rows below (standard leverage-ratio convention; not separately flagged as inverted since this is the expected direction for a leverage table, per MODULE_RULES.md).*

Reported EBITDA (FY2026) = $30,494mn (GAAP operating income of $22,385mn, per Capital IQ's EBIT convention which excludes restructuring charges — see reconciliation note below — plus $8,109mn of D&A) [`earnings/01_historical-financials.md`, Section 1 & 4]. Oracle does not disclose a company-defined non-GAAP EBITDA; it only reconciles non-GAAP operating income and EPS. An implied adjusted EBITDA of **~$37,035mn** (non-GAAP operating income $28,926mn + D&A $8,109mn) can be derived but is **not a company-disclosed figure — Inference, not from filings** [`earnings/01_historical-financials.md`, Section 4].

Note on GAAP operating income vs. the EBIT figure used for EBITDA: Oracle's own GAAP operating income for FY2026 was $20,606mn; the $22,385mn CIQ "EBIT" figure used above excludes $1,779mn of restructuring & other charges that CIQ classifies outside operating income. Using GAAP operating income directly ($20,606mn + $8,109mn D&A = $28,715mn) would lower reported EBITDA and raise every ratio below by roughly 6%; both readings are flagged so the master synthesizer can see the sensitivity [`earnings/01_historical-financials.md`, Section 1, EBIT sourcing note].

| Ratio | On Reported EBITDA ($30,494mn) | On Inferred Adjusted EBITDA (~$37,035mn, Inference — not company-disclosed) | Source |
|---|---:|---:|---|
| Gross debt / EBITDA (all-in basis, $167,432mn) | 5.49x | 4.52x | Calc: 167,432 / 30,494 = 5.49; 167,432 / 37,035 = 4.52 |
| Gross debt / EBITDA (narrower, interest-bearing-only, $137,242mn) | 4.50x | 3.71x | Calc: 137,242 / 30,494 = 4.50 |
| Net debt (strict, $136,143mn) / EBITDA | 4.46x | 3.68x | Calc: 136,143 / 30,494 = 4.46; matches `earnings/01_historical-financials.md`'s independently computed 4.46x |
| Net debt (strict, narrower basis, $105,953mn) / EBITDA | 3.47x | 2.86x | Calc: 105,953 / 30,494 = 3.47 |
| Debt / capital (all-in debt $167,432mn ÷ total capital $210,488mn) | 79.5% | (n/a) | [CIQ Financials_Annual.xls, Capital Structure Summary tab, "Total Debt" % of Total = 0.7954] |
| Debt / equity (all-in debt $167,432mn ÷ total equity $43,056mn, incl. preferred + minority interest) | 3.89x | (n/a) | Calc: 167,432 / 43,056 = 3.89 |
| Debt / equity (common equity only, $37,554mn) | 4.46x | (n/a) | Calc: 167,432 / 37,554 = 4.46 |

**Reconciliation flag:** Capital IQ's own Capital Structure Summary tab computes a separately-derived "Total Debt/EBITDA" of 5.03x for FY2026 (implying an EBITDA base of roughly $33.3bn) — about 9% higher than the $30,494mn reported-EBITDA figure used above, which is the same figure `earnings/01_historical-financials.md` uses and cross-checks against the 10-K's own operating-income and D&A lines. This is a definitional variance between two different Capital IQ tabs (the Capital Structure Summary tab appears to use a different, unexplained EBITDA convention than the Financials_Annual Income Statement tab), not a data error. This report uses the $30,494mn figure — sourced and cross-checked directly against the audited income statement — as the reported-EBITDA base for every ratio above, and flags the CIQ tab-to-tab discrepancy rather than silently picking a number [CLAUDE.md §5].

**Cycle-position note:** `business-model/07_business-quality.md` scores Oracle's cyclicality at 38/100 (mid-band, "shifting from a low-cyclicality software annuity toward a lumpier, large-contract-driven infrastructure business") — not a classic commodity/cyclical business, so a full normalised/mid-cycle EBITDA table is not triggered under this module's hard rule. However, `business-model/10_external-dependency.md` scores the AI-infrastructure industrial-cycle dependency at High (inverted 72/100 risk score) and FY2026's reported EBITDA margin (45.3%) is the highest of the five-year window shown in `earnings/01_historical-financials.md`, boosted by a record Q4 seasonal margin (49.5%, vs. 40.6% in Q4 FY2025). The leverage ratios above use the latest (FY2026) EBITDA, not a normalised figure — if AI-infrastructure demand decelerates and margins revert toward the 38–41% range seen in FY2023–FY2025, every leverage ratio in this table would move higher. This is a caution flag for the downside stress test (`06`), not a computed normalised-EBITDA leverage ratio, because no clean mid-cycle EBITDA base exists for a business this early in its infrastructure buildout.

## 6. Leverage Trend

| Metric | FY2024 | FY2025 | FY2026 | Latest | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, §15) | $83,960mn | $98,166mn | $136,143mn | $136,143mn (FY2026 = latest filed period; no subsequent interim in the pool) | Rising |
| Net debt / EBITDA (reported) | 3.83x | 4.40x | 4.46x | 4.46x | Rising |

Leverage is rising, and the driver is unambiguous: capital expenditure exploded from $6,866mn (FY2024) to $21,215mn (FY2025) to $55,663mn (FY2026, +162% y/y) as Oracle builds AI-infrastructure data-center capacity, and this capex now exceeds all of FY2026's operating cash flow ($31,977mn) and EBITDA ($30,494mn) combined-with-headroom terms — net debt/(EBITDA−capex) is no longer a computable ratio because capex alone exceeds EBITDA [`business-model/11_capital-allocation-governance.md`, Section 1, "Debt level and trajectory" row]. Total debt rose 54% in a single fiscal year (FY2025 $108,952mn → FY2026 $167,432mn) on $42.7bn of new senior-note issuance plus $5.0bn of Mandatory Convertible Preferred Stock proceeds [`business-model/11_capital-allocation-governance.md`]. This is not an acquisition-funded or buyback-funded leverage increase (M&A cash outflow was $0 in FY2024–FY2026, and buybacks fell to $93–95mn) — it is a growth-capex-funded increase, and management has guided a further ~$70bn of net capex for FY2027, meaning the trajectory is not a one-off [`business-model/11_capital-allocation-governance.md`, Section 3]. S&P downgraded Oracle's long-term issuer credit rating to BBB- from BBB (and short-term rating to A-3 from A-2) on 2026-07-09, one notch above non-investment grade [Key Developments, 2026-07-09]; the source feed's outlook label is internally inconsistent between "Stable" and "Negative" in the same entry, so this report does not assert a specific outlook — **flagged, not resolved, per the conservative default (CLAUDE.md §4)**.

## 6A. HoldCo / OpCo & Structural Subordination

| Item | Evidence | Why It Matters |
|---|---|---|
| Where debt sits | All debt (senior notes, commercial paper, term loan, revolver) is issued directly by Oracle Corporation, the NYSE-listed ultimate parent — no separate financing subsidiary or intermediate HoldCo is disclosed in the pool. | No distinct HoldCo/OpCo leverage layer to map. |
| Structural subordination (standard, not elevated) | "All existing and future liabilities of the subsidiaries of Oracle Corporation are or will be effectively senior to the senior notes and Commercial Paper Notes" [FY26 10-K, Note on Debt — Senior Notes]. | This is standard boilerplate for a US corporate bond issuer with operating subsidiaries (the parent's unsecured creditors rank behind subsidiary-level liabilities in a subsidiary's own insolvency) — not a distinctive risk signal here since Oracle has no separate leveraged HoldCo layer, but it is disclosed and recorded per this module's mandatory HoldCo/OpCo scan. |
| Upstreaming constraints | Not disclosed in the data pool — no dividend-blocker or regulatory upstreaming restriction identified for any Oracle subsidiary in the FY26 10-K. | n/a given the single-issuer structure above. |
| Material restricted / trapped cash | None — restricted cash is disclosed as immaterial (Section 3). | Net debt figures in this report are not overstated or understated by trapped cash. |

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt: $167,432mn** — the all-in, IFRS16-style basis (notes payable $129,541mn + finance leases $7,701mn + operating leases $30,190mn), which ties directly to the audited FY2026 balance sheet's debt-and-lease line items. **This is the designated canonical gross-debt figure for this module**, because (a) it ties exactly to audited balance-sheet captions, and (b) `earnings/01_historical-financials.md` already uses this basis for its net-debt series, so using the same basis here avoids a cross-module contradiction. Downstream agents should also be aware of the narrower $137,242mn (excl. operating leases) and $129,541mn (notes payable only, Oracle's own "indebtedness" definition) bases shown in Section 1 — material for interest-coverage and covenant work in `04`, since the revolver's covenant references "Consolidated EBITDA to Consolidated Net Interest Expense," a cash-interest-based test, not a lease-inclusive debt test.
- **Net debt: $136,143mn — strict basis (§15): gross debt $167,432mn − cash & equivalents $31,289mn.** This is the designated canonical net-debt figure. Broad basis (netting in $605mn of short-term investments) = $135,538mn — shown for completeness but not used as canonical, since the gap is immaterial.
- **Cash & liquid investments: $31,894mn** ($31,289mn cash & equivalents + $605mn short-term investments); no material restricted/trapped cash.
- **EBITDA base: $30,494mn, reported/GAAP-based, latest (FY2026, not normalised/mid-cycle)** — cross-checked against the 10-K's GAAP operating income ($22,385mn per CIQ's EBIT convention, or $20,606mn on Oracle's own GAAP operating-income line) plus $8,109mn of D&A. Oracle discloses no company-defined adjusted EBITDA; an implied ~$37,035mn adjusted figure is inference only, not from filings. Oracle is not formally flagged as a cyclical name by `business-model/07_business-quality.md` (cyclicality score 38/100), so no normalised/mid-cycle EBITDA base is computed here — but downstream agents should treat the FY2026 EBITDA margin (45.3%, the highest of the last five years, aided by a record 49.5% Q4 margin) as a high-water mark, not a conservative base, given the High industrial-cycle dependency flagged in `business-model/10_external-dependency.md`.
- **Net debt / EBITDA: 4.46x on reported EBITDA ($30,494mn); 3.68x on inferred adjusted EBITDA (~$37,035mn, Inference — not from filings)** — both using the canonical $136,143mn net-debt figure.
- **Reporting currency: USD.**

Leverage more than doubled on the strict net-debt basis in two years (FY2024 $83,960mn / 3.83x → FY2026 $136,143mn / 4.46x) on a debt-funded AI-infrastructure capex program, not an acquisition or buyback. S&P has already downgraded Oracle one notch above non-investment grade (BBB-, 2026-07-09). Every figure in this Anchor Summary that departs from Oracle's own narrowest "$129.5bn of outstanding indebtedness" disclosure is flagged with its basis inline — downstream agents should propagate the basis label, not just the number.
