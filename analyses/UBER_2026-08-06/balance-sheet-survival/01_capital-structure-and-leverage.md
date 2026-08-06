# Capital Structure & Leverage — UBER

**Reporting currency:** USD (millions unless stated). **Reporting standard:** US GAAP, fiscal year end Dec-31. **Source-pool caveat (carried from `00_solvency-data-triage.md`):** no primary SEC filing (10-K/10-Q) is physically present in `data/UBER/`; every balance-sheet and debt-note figure below is Capital IQ's vendor transcription of Uber's FY2025 10-K (filed 2026-02-13) and Q2 FY2026 results (released 2026-08-05) — cited as "CIQ export," never as "10-K." No `ciq_facts.json` sidecar exists for this run, so every figure is this agent's own sourced read of the CIQ workbook tabs, cross-checked line-by-line against `earnings/01_historical-financials.md`. The Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record and is cited as such.

**Cyclicality flag (from `business-model/07_business-quality.md`):** cyclicality scored 38/100 (inverted: lower = more cyclical) — "a real cyclical downside is visible in the record (FY2020, FY2022–25 Freight), not merely theoretical." Per `MODULE_RULES.md` Calculation Standard 4, Section 5 below therefore shows leverage on both latest and a normalised/mid-cycle EBITDA base, labelled.

## 1. Debt Stack

Instrument-level detail below is as of **FY2025 (Dec-31-2025)**, the most recent full instrument-level breakout in the pool, filed 2026-02-13 [CIQ export — Financials.xls, Capital Structure Details tab]. All disclosed fixed-rate debt; **Variable Rate Debt = $0** and the revolver (undrawn) is the only floating-rate-benchmarked facility [CIQ export — Financials.xls, Capital Structure Summary tab, "Fixed Rate Debt" / "Variable Rate Debt" rows, FY2025].

| Instrument | Amount (FY2025, $mm) | Entity | Secured? | Seniority | Collateral | Maturity | Rate | Source |
|---|---:|---|---|---|---|---|---|---|
| Current portion of LT debt/leases | 307 (leases only; no bond current maturity at FY2025) | Uber Technologies, Inc. (single reporting entity) | No (bonds); Yes (leases, secured by leased asset) | Senior | n/a / leased asset | Various, within 12mo of Dec-31-2025 | n/a | CIQ export, Balance Sheet tab, FY2025 |
| 2028 Convertible Notes | 1,725 | Uber Technologies, Inc. | No | Senior | n/a | 2028-12-01 | 0.875% fixed, convertible | CIQ export, Capital Structure Details tab |
| 2028 Exchangeable Senior Notes | 1,125 | Uber Technologies, Inc. | **Yes** | Senior | Not itemized beyond "secured" flag | 2028-05-15 | 0.000% fixed (zero-coupon), exchangeable | CIQ export, Capital Structure Details tab |
| 2029 Senior Note | 1,500 | Uber Technologies, Inc. | No | Senior | n/a | 2029-08-15 | 4.500% fixed | CIQ export, Capital Structure Details tab |
| 2030 Senior Note | 1,250 | Uber Technologies, Inc. | No | Senior | n/a | 2030-01-15 | 4.300% fixed | CIQ export, Capital Structure Details tab |
| 2031 Senior Notes | 1,000 | Uber Technologies, Inc. | No | Senior | n/a | 2031-01-15 | 4.150% fixed | CIQ export, Capital Structure Details tab |
| 2034 Senior Note | 1,500 | Uber Technologies, Inc. | No | Senior | n/a | 2034-09-15 | 4.800% fixed | CIQ export, Capital Structure Details tab |
| 2035 Senior Notes | 1,250 | Uber Technologies, Inc. | No | Senior | n/a | 2035-09-15 | 4.800% fixed | CIQ export, Capital Structure Details tab |
| 2054 Senior Note | 1,250 | Uber Technologies, Inc. | No | Senior | n/a | 2054-09-15 | 5.350% fixed | CIQ export, Capital Structure Details tab |
| Commercial paper program | 0 drawn ($2,000 undrawn capacity) | Uber Technologies, Inc. | No | Senior | n/a | Program renews (2026-07-01 reference date) | n/a (undrawn) | CIQ export, Capital Structure Details / Summary tabs |
| Revolver (Senior Unsecured Revolving Loans) | 0 drawn ($4,657 undrawn, FY2025) | Uber Technologies, Inc. | No | Senior | n/a | 2029-09-26 | Benchmark (floating), undrawn | CIQ export, Capital Structure Details / Summary tabs |
| Finance leases | 222 | Uber Technologies, Inc. | Yes | Senior | Leased asset | Through 2030 | 6.000% imputed | CIQ export, Capital Structure Details tab |
| Operating lease liabilities | 1,559 | Uber Technologies, Inc. | Yes (tagged secured — collateral is the leased asset) | Senior | Leased asset | Various (schedule in `02`) | 6.600% imputed | CIQ export, Capital Structure Details tab |
| **Total gross debt (FY2025)** | **12,302** | | | | | | | Sum of principal ($12,381) + debt discount/issuance-cost adjustments (−$79) [CIQ export, Capital Structure Summary tab] |

**Reconciliation check:** Total Senior Bonds and Notes ($10,600) + Total Lease Liabilities ($1,781, = finance leases $222 + operating lease liabilities $1,559) = Total Principal Due $12,381; less $79mm of net discount/issuance-cost adjustments = Total Debt Outstanding $12,302 — ties exactly to the Balance Sheet tab's FY2025 "Total Debt" supplemental row [CIQ export, Balance Sheet tab, FY2025 column].

**Roll-forward to the latest balance sheet (Jun-30-2026, Q2 FY2026 press release):** gross debt rose to **$14,731mm** — Current Portion of LT Debt $1,997mm + Current Portion of Leases $178mm + Long-Term Debt $10,726mm + Long-Term Leases $1,830mm [CIQ export, Balance Sheet tab, Jun-30-2026 Press-Release column] — a **+$2,429mm increase over FY2025**. Instrument-level detail (which specific notes/facilities account for the increase) is **not disclosed in the pool** for Q2 FY2026; only the FY2025 year-end breakout above has instrument granularity. Cash-flow evidence corroborates new debt issuance: LTM Jun-30-2026 Total Debt Issued = $6,229mm vs. Total Debt Repaid = $4,514mm, net debt issued = $1,715mm [CIQ export, Cash Flow tab, LTM column] — roughly coincident with the ~$4,000mm of capital management spent building the Delivery Hero market stake in Q2 2026 [`business-model/11_capital-allocation-governance.md`]. **Partial data: the exact instrument composition of the $2,429mm FY2025→Q2 FY2026 debt increase is not disclosed in this pool** — flagged for `02_maturity-wall-and-refinancing`.

**Material forward item — NOT included in any total above:** Uber signed a Business Combination Agreement (2026-07-16) to acquire the remaining ~63.21% stake in Delivery Hero SE for €8.4bn (€41.50/share cash, €12.9bn / $14.8bn total equity value), financed by a **committed bridge facility of approximately €14 billion** from affiliates of Morgan Stanley, Bank of America, and Deutsche Bank [CIQ export, UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, deal-summary text]. The deal is **not yet closed** — offer expected H2 2027, subject to a 50%+1-share acceptance threshold and merger-control/competition/financial-regulatory approvals; termination fees are €700mm (Uber) / €200mm (Delivery Hero) if either side walks. **None of the €14bn bridge facility appears in the Jun-30-2026 balance sheet.** This is a near-certain, material future addition to gross debt that current-period leverage ratios below do not reflect — downstream agents (`02`, `06`) must treat it as a labelled pro-forma overlay, not a sunk fact.

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating leases (US GAAP, ASC 842) | $1,559mm (FY2025); $1,830mm LT + $178mm current = $2,008mm combined lease liability at Jun-30-2026 (finance + operating leases not split in the Q2 press-release balance sheet) | US GAAP (ASC 842) already capitalizes operating leases on the balance sheet (post-2019) — unlike the pre-2019 US GAAP treatment, there is no off-balance-sheet operating-lease gap here to add back. Already included in "Total gross debt" above. | CIQ export, Balance Sheet tab / Capital Structure Details & Summary tabs |
| Pension / OPEB underfunding | None | Uber discloses no pension/OPEB plan — CIQ's dedicated Pension/OPEB tab returns "No Data Available." This is a true absence of the obligation, not a missing disclosure. | CIQ export, Financials.xls, Pension OPEB tab |
| Preferred equity | None | No preferred stock line on the balance sheet; Historical Capitalization tab shows "+ Pref. Equity: -" for every period shown. | CIQ export, Balance Sheet tab / Historical Capitalization tab |

## 3. Cash & Liquid Assets

All figures as of Jun-30-2026 (Q2 FY2026 press-release balance sheet) unless noted.

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | $4,870mm | No | CIQ export, Balance Sheet tab, Jun-30-2026 |
| Liquid short-term investments | $521mm | No | CIQ export, Balance Sheet tab, Jun-30-2026 |
| **Total cash & ST investments** | **$5,391mm** | — | CIQ export, Balance Sheet tab, Jun-30-2026 |
| Restricted cash | $661mm | **Yes — flagged, excluded from all net-debt and liquidity figures below** | CIQ export, Balance Sheet tab, Jun-30-2026 ("Restricted Cash" line, reported separately from Cash & Equivalents / Total Cash & ST Investments) |
| Long-term investments (not liquid — excluded) | $12,532mm | Not restricted, but **not liquid/near-cash** — a mix of equity-method investments ($3,773mm, incl. AV-partner and Delivery Hero-adjacent stakes) and other long-term securities; not netted into any figure below | CIQ export, Balance Sheet tab, Jun-30-2026 |

**Note on a CIQ definitional inconsistency (flagged, not adopted):** the Balance Sheet tab's own precomputed "Net Debt" supplemental row nets in not just cash & ST investments but also a further pool of "Long-Term Marketable Securities" for FY2021–FY2025 (e.g. FY2025: $12,302mm debt − $7,633mm cash&STInv − $4,593mm LT marketable securities = $76mm, ties to the row exactly) — but stops doing so at Jun-30-2026 (where $14,731mm − $5,391mm = $9,340mm ties without any further subtraction), most likely because that investment pool is now dominated by the illiquid Delivery Hero strategic equity stake rather than liquid marketable securities. Because this vendor row silently switches basis across periods, **this agent does not use it** — Section 4 below computes net debt directly and consistently from the raw balance-sheet cash/investment/debt lines for every period, per CLAUDE.md §15.

## 4. Gross & Net Debt

| Metric | Value ($mm, Jun-30-2026) | Source |
|---|---:|---|
| Gross debt | 14,731 | CIQ export, Balance Sheet tab, Jun-30-2026 (supplemental "Total Debt" row) |
| − Cash & equivalents | 4,870 | CIQ export, Balance Sheet tab, Jun-30-2026 |
| **Net debt (strict, §15) — CANONICAL** | **9,861** | Calc: 14,731 − 4,870 |
| − Liquid short-term investments (additional) | 521 | CIQ export, Balance Sheet tab, Jun-30-2026 |
| **Net debt (broad, incl. ST investments)** | **9,340** | Calc: 14,731 − 5,391. (This broad figure happens to match CIQ's own precomputed "Net Debt" row for this one period only — see note above on why it diverges in earlier periods.) |

**Basis designation:** the **strict** figure ($9,861mm) is the canonical net-debt figure this module uses downstream (default per `MODULE_RULES.md` Calculation Standard 3 — no stated reason to prefer broad). The broad figure is shown alongside, labelled, because liquid ST investments ($521mm) are material enough to move net leverage by roughly 0.05x on Adj. EBITDA. Restricted cash ($661mm) and long-term investments ($12,532mm) are excluded from both bases — see Section 3.

## 5. Leverage Ratios

EBITDA bases, both labelled per `earnings/01_historical-financials.md`: (1) **Reported/GAAP-based EBITDA** = Operating Income + D&A (CapIQ-standardized, LTM Jun-30-2026 = $7,474mm) [CIQ export, Income Statement tab]; (2) **Adjusted EBITDA (company-defined, non-GAAP)** = Uber's own guided metric, adds back stock-based compensation ($1,939mm LTM) and other unitemized items (LTM Jun-30-2026 = $10,043mm, per `earnings/01_historical-financials.md` §2, cross-checked to the Segments tab's "Total EBITDA" row). Cycle position: LTM/latest = current print; see the normalised row below for the cyclicality flag.

| Ratio | On Reported/GAAP EBITDA (LTM $7,474mm) | On Adjusted EBITDA (LTM $10,043mm) | Source / Formula |
|---|---:|---:|---|
| Gross debt / EBITDA | 1.97x | 1.47x | 14,731 / EBITDA |
| Net debt / EBITDA (strict basis, canonical) | 1.32x | 0.98x | 9,861 / EBITDA |
| Net debt / EBITDA (broad basis, labelled) | 1.25x | 0.93x | 9,340 / EBITDA |
| Debt / capital | 34.2% | (n/a) | 14,731 / (14,731 + 27,316 common equity + 1,083 minority interest = 43,130) [CIQ export, Balance Sheet tab, Jun-30-2026] |
| Debt / equity (common equity basis) | 53.9% | (n/a) | 14,731 / 27,316 |
| Debt / equity (total equity incl. minority interest) | 51.9% | (n/a) | 14,731 / 28,399 |

**Cyclicality row (per `business-model/07_business-quality.md` flag, cyclicality 38/100):** on a normalised/mid-cycle EBITDA base — the FY2023–FY2025 3-year average, since Uber has under one full standalone leverage cycle post-turnaround-to-profitability — net leverage reads meaningfully worse than the latest print:

| Basis | Reported/GAAP EBITDA | Adj. EBITDA | Net debt (strict) / EBITDA |
|---|---:|---:|---:|
| **Latest / LTM (peak-to-date)** | 7,474 | 10,043 | 1.32x (GAAP) / 0.98x (Adj.) |
| **Normalised / mid-cycle (FY2023–FY2025 3-yr avg)** | 3,927 | 6,422 | 2.51x (GAAP) / 1.54x (Adj.) |

**Caveat on the normalised row:** Uber's FY2023–FY2025 EBITDA trajectory (GAAP: $1,933mm → $3,536mm → $6,312mm) reflects a structural margin inflection — a business scaling out of losses toward profitability — not a repeating cyclical oscillation around a stable mean, so this 3-year average is a conservative floor-check, not a claim that EBITDA will revert to it. The evidenced cyclical swing actually visible in the record is narrower and segment-specific: Freight segment revenue fell from a $6,947mm FY2022 peak to $5,099mm in FY2025 (−27% over three years), tracking a broader trucking-freight recession [`business-model/07_business-quality.md`, `03_segment-map.md`], and the FY2020 COVID trough took Mobility segment margin to near breakeven. Freight is ~9.8% of FY2025 group revenue, so a Freight-specific downturn alone would not move group EBITDA by anywhere near the gap shown in the table above — the table is shown per the module's hard rule, but the group-level normalised figure should be read as a scaling-stage floor-check, not a peak/trough cyclical estimate.

**Cross-check against CIQ's own precomputed Credit Ratios (Capital Structure Summary tab, rolls only to Mar-31-2026, not Jun-30-2026):** Total Debt/EBITDA 2.91x (FY2024) → 1.84x (FY2025) → 1.40x (Mar-2026); Net Debt/EBITDA NM (FY2024) → 0.01x (FY2025) → 0.28x (Mar-2026). These use a CIQ-internal EBITDA denominator not separately itemized in the pool and are shown here only as a reference point — they do not exactly reproduce this agent's own GAAP- or Adjusted-EBITDA-based ratios above (formula and EBITDA source both stated, per module rule 13), and in any case predate the Jun-30-2026 debt increase.

## 6. Leverage Trend

Net debt shown on the **strict** basis (gross debt − cash & equivalents), computed consistently from raw balance-sheet lines for every period (see Section 3 note on why CIQ's own precomputed row is not used).

| Metric | FY2023 | FY2024 | FY2025 | Latest (Jun-30-2026) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, $mm) | 7,022 | 5,543 | 5,197 | 9,861 | Falling FY2023→FY2025, then **rising sharply** in H1 FY2026 |
| Net debt / EBITDA (GAAP-based) | 3.63x | 1.57x | 0.82x | 1.32x | Same pattern |
| Net debt / EBITDA (Adj. EBITDA-based) | 1.73x | 0.85x | 0.60x | 0.98x | Same pattern |
| Gross debt / EBITDA (GAAP-based) | 6.05x | 3.23x | 1.95x | 1.97x | Falling FY2023→FY2025, roughly flat since |

Leverage fell steadily through FY2023–FY2025 as EBITDA scaled (GAAP EBITDA +227% over the two years, gross debt essentially flat to down) — a genuine deleveraging-through-earnings-growth story, not debt paydown: gross debt actually rose slightly from $11,702mm (FY2023) to $12,302mm (FY2025) [CIQ export, Balance Sheet tab], while cash built from $5,407mm to $7,633mm, so net debt fell mainly on the cash side. That trend reversed in H1 FY2026: net debt (strict) rose $4,664mm from FY2025 year-end to Jun-30-2026, driven by (1) new debt issuance ($6,229mm gross issued LTM vs. $4,514mm repaid, net +$1,715mm [CIQ export, Cash Flow tab]) and (2) a cash drawdown used to help fund roughly $4,000mm of Delivery Hero market-stake purchases in Q2 FY2026 [`business-model/11_capital-allocation-governance.md`; Q2 FY2026 earnings-call transcript]. This is a pre-funding step ahead of the much larger ~€14bn bridge facility for the full Delivery Hero acquisition (Section 1), which is not yet drawn or reflected in any period shown.

## 6A. HoldCo / OpCo & Structural Subordination

Not applicable — no material HoldCo-level debt indicated. Every instrument in the FY2025 Capital Structure Details tab is issued at the single reporting entity level (Uber Technologies, Inc.); no subordinated-financing or structural-subordination note is present in the pool for Careem or any other subsidiary [`00_solvency-data-triage.md`, §3]. This is not an affirmative "no HoldCo debt exists anywhere" finding (no dedicated corporate-structure/guarantor note is in the pool), but nothing in the available data indicates one.

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt:** $14,731mm (Jun-30-2026, Q2 FY2026 press-release balance sheet) [CIQ export, Balance Sheet tab]
- **Net debt — CANONICAL (strict, §15 basis):** $9,861mm = $14,731mm gross debt − $4,870mm cash & equivalents. **Broad basis (labelled, not canonical):** $9,340mm, additionally netting $521mm of liquid ST investments.
- **Cash & liquid investments:** $5,391mm total (cash & equivalents $4,870mm + ST investments $521mm). Excludes $661mm restricted cash (flagged, not counted) and $12,532mm of illiquid long-term investments.
- **EBITDA base used:** Reported/GAAP-based EBITDA, LTM Jun-30-2026 = **$7,474mm** (Operating Income + D&A); Adjusted EBITDA (company-defined, non-GAAP), LTM Jun-30-2026 = **$10,043mm**. Cycle position: this is the **latest/peak-to-date** print — a normalised/mid-cycle 3-year average (FY2023–FY2025) is $3,927mm (GAAP) / $6,422mm (Adj.), shown in Section 5 with its caveat (structural-maturation distortion, not a clean cyclical trough/peak).
- **Net debt / EBITDA (canonical net debt, both EBITDA bases):** 1.32x on Reported/GAAP EBITDA; 0.98x on Adjusted EBITDA. On the normalised/mid-cycle base: 2.51x (GAAP) / 1.54x (Adj.) — carry this caveat downstream if a stress scenario uses it.
- **Reporting currency:** USD.
- **Propagate downstream:** (1) gross debt rose $2,429mm from FY2025 to Q2 FY2026 with no instrument-level breakout available in this pool — flagged for `02`; (2) the ~€14bn Delivery Hero bridge facility is signed but undrawn and not in any figure above — treat as a material, near-certain pro-forma overlay, not a sunk fact, for `02` and `06`; (3) this agent's own net-debt and leverage figures deliberately diverge from CIQ's own precomputed "Net Debt" row because that row's definition is inconsistent across periods (Section 3) — downstream agents should use the figures in this Anchor Summary, not the raw CIQ "Net Debt" supplemental row.

Uber is **not** net cash at the latest balance-sheet date (net debt strict $9,861mm positive). It was intermittently net cash in FY2021 and briefly near-net-cash at FY2024 (strict net debt $5,543mm was still positive on this agent's consistent calculation — see Section 6; only CIQ's own inconsistent broader netting showed a negative/net-cash figure that period) — this is noted for completeness but should not be read as a "net cash balance sheet" positive-flexibility finding, since on the strict, consistently-applied basis Uber has carried net debt in every period shown.
