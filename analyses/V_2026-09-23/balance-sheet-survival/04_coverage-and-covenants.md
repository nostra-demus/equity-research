# Coverage & Covenants — V

Visa Inc. (NYSE: V) reports in USD under U.S. GAAP and has a September fiscal year-end. Unless noted, ratios use the latest twelve months (LTM) ended June 30, 2026 and USD millions. EBITDA is **GAAP-derived**—reported operating income plus depreciation and amortization—because Visa does not report either EBITDA or company-defined adjusted EBITDA. It is not a cash substitute: LTM CFO was 79.7% of this EBITDA, above the 70% reference point but below the FY23–FY25 range, so the cash conversion trend remains a qualifier. `[Visa FY2025 Form 10-K, Consolidated Statements of Operations and Cash Flows, pp.60, 65; Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Operations and Cash Flows, pp.4, 10; analyses/V_2026-09-23/earnings/06_earnings-quality.md, Section 2]`

## 1. Coverage Ratios

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | 36.52x = $28,338 / $776 | `[Visa FY2025 Form 10-K, Consolidated Statements of Operations, p.60; Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Operations, p.4; calculation]` |
| EBIT / interest | 34.79x = $26,996 / $776 | `[Visa FY2025 Form 10-K, Consolidated Statements of Operations, p.60; Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Operations, p.4; calculation]` |
| (EBITDA − capex) / interest | 34.50x = ($28,338 − $1,567) / $776 | `[Visa FY2025 Form 10-K, Consolidated Statements of Cash Flows, p.65; Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows, p.10; calculation]` |
| Fixed-charge coverage | 6.75x indicative = ($28,338 − $1,567) / ($776 + $2,996 + $195) | `[Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, p.4; Visa FY2025 Form 10-K, Note 9 (Leases), p.82; calculation]` |

The interest denominator is **gross reported interest expense**, not net interest: LTM $776m = $566m for FY26 nine months plus $210m for FY25 Q4 ($589m FY25 less $379m in FY25 nine months). LTM cash interest payments were $648m, but expense is used for the first three ratios under the module rule. `[Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Operations and Cash Flows, pp.4, 10; Visa FY2025 Form 10-K, Consolidated Statements of Operations and Cash Flows, pp.60, 65; calculation]`

The fixed-charge result is deliberately labelled **indicative**, not a contractual debt-service test: it uses all $2,996m current debt, including $1,500m commercial paper, so it makes no rollover assumption, plus FY25 operating-lease cost of $195m as the nearest annual lease-charge proxy. This pairs an LTM earnings numerator with point-in-time current debt and a prior-year lease-cost proxy; the filing does not provide a matched LTM scheduled-principal-and-lease-payment figure. `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18; Visa FY2025 Form 10-K, Note 9 (Leases), p.82]`

As a vendor cross-check only, the source-bound facts sidecar reports 40.1x LTM interest coverage using CIQ's $31,094m special-item-excluding EBITDA, rather than the $28,338m GAAP-derived numerator above. The difference is a numerator-basis difference, not a conflict in the approximately $776m interest read; CIQ's number is not substituted for the filing-derived measure. `[ciq_facts.json, interest_coverage_x and ltm_ebitda_m, LTM Jun-30-2026 — CIQ vendor basis]`

Calculation check (Bash executed):

```text
$ awk 'BEGIN {ebitda=28338; ebit=26996; capex=1567; interest=776; current_debt=2996; lease_cost=195; net_debt=11499; max_lev=4; min_cov=3; printf "EBITDA/interest = %.2fx\\n", ebitda/interest; printf "EBIT/interest = %.2fx\\n", ebit/interest; printf "(EBITDA-capex)/interest = %.2fx\\n", (ebitda-capex)/interest; printf "Indicative fixed-charge coverage = %.2fx\\n", (ebitda-capex)/(interest+current_debt+lease_cost); printf "Assumed 4.0x net-leverage headroom = %.1f%%\\n", (max_lev-net_debt/ebitda)/max_lev*100; printf "EBITDA at assumed leverage breach = $%.0fm; decline = %.1f%%\\n", net_debt/max_lev, (1-(net_debt/max_lev)/ebitda)*100; printf "Net-debt increase to assumed leverage breach = $%.0fm\\n", max_lev*ebitda-net_debt; printf "Assumed 3.0x interest-coverage headroom = %.1f%%\\n", ((ebitda/interest)-min_cov)/min_cov*100; printf "EBITDA decline to assumed coverage breach = %.1f%%\\n", (1-(min_cov*interest)/ebitda)*100 }'
EBITDA/interest = 36.52x
EBIT/interest = 34.79x
(EBITDA-capex)/interest = 34.50x
Indicative fixed-charge coverage = 6.75x
Assumed 4.0x net-leverage headroom = 89.9%
EBITDA at assumed leverage breach = $2875m; decline = 89.9%
Net-debt increase to assumed leverage breach = $101853m
Assumed 3.0x interest-coverage headroom = 1117.3%
EBITDA decline to assumed coverage breach = 91.8%
```

## 2. Covenant Inventory

The admitted filings state that Visa complied with the senior-note and revolver covenants, but they do **not** state a numerical maintenance-covenant threshold, the lender-defined calculation, or the current covenant actual. The 2023 amended revolver is identified in the FY25 exhibit index but the agreement itself is not in the frozen pool inventory. It would therefore be incorrect to infer that Visa has no financial covenants. Contractual covenant headroom is **Not assessable** and the module's partial-data cap applies. `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), p.18; Visa FY2025 Form 10-K, Note 10 (Credit Facility), p.84 and Exhibit Index; data/V/manifest.json, frozen evidence-generation inventory]`

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage — **labeled market-convention illustration, not Visa contractual term** | ≤4.0x assumption | 0.41x strict net debt / GAAP-derived EBITDA | +89.9% illustrative; **Not assessable for scoring** | `[Assumption, not from filings: role partial-data rule; Visa Q3 FY2026 Form 10-Q, pp.4, 17–18; calculation]` |
| Min interest coverage — **labeled market-convention illustration, not Visa contractual term** | ≥3.0x assumption | 36.52x EBITDA / gross interest | +1,117.3% illustrative; **Not assessable for scoring** | `[Assumption, not from filings: role partial-data rule; Visa FY2025 Form 10-K, p.60; Visa Q3 FY2026 Form 10-Q, p.4; calculation]` |
| Min liquidity / net worth | Not disclosed | Not disclosed | Not assessable | `[Visa FY2025 Form 10-K, Note 10 (Credit Facility), p.84; data/V/manifest.json, frozen evidence-generation inventory]` |
| Springing covenant trigger (e.g., revolver utilization threshold) | Not disclosed | $7,000m revolver commitment; $0 drawn in CIQ June-quarter workbook | Not assessable | `[Visa FY2025 Form 10-K, Note 10 (Credit Facility), p.84; Capital IQ Financials Quarterly, Capital Structure Summary, Jun-30-2026 — vendor export in data/V/]` |
| Equity cure rights (Y/N, limits) | Not disclosed | Not disclosed | Not assessable | `[Visa FY2025 Form 10-K, Exhibit Index; data/V/manifest.json, frozen evidence-generation inventory]` |
| Other | Senior notes: compliance disclosed; numerical and operational covenant terms not disclosed | Compliant at Jun. 30, 2026 | Not assessable | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), p.18]` |

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not disclosed. The illustrative leverage calculation uses $28,338m GAAP-derived LTM EBITDA, which is not lender-defined Covenant EBITDA. | `[Visa FY2025 Form 10-K, p.60; Visa Q3 FY2026 Form 10-Q, p.4; calculation]` |
| Addbacks permitted (types) | Not disclosed in the admitted credit-agreement materials. | `[Visa FY2025 Form 10-K, Exhibit Index; data/V/manifest.json, frozen evidence-generation inventory]` |
| Addback caps / limits | Not disclosed in the admitted credit-agreement materials. | `[Visa FY2025 Form 10-K, Exhibit Index; data/V/manifest.json, frozen evidence-generation inventory]` |
| Is covenant EBITDA materially above reported EBITDA? | Not assessable. CIQ's $31,094m vendor EBITDA is $2,756m (9.7%) above GAAP-derived EBITDA, but it is not evidence of a covenant addback. Headroom quality is therefore unknown; an addback-illusion check cannot be performed. | `[ciq_facts.json, ltm_ebitda_m, LTM Jun-30-2026 — CIQ vendor basis; Visa FY2025 Form 10-K, p.60; Visa Q3 FY2026 Form 10-Q, p.4; calculation]` |

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | No contractual maintenance covenant can be identified from the admitted evidence. Illustrative only: assumed 4.0x maximum net leverage. |
| Headroom on tightest covenant (%) | Not assessable contractually; +89.9% under the illustrative 4.0x assumption. |
| EBITDA decline that would breach it (approx.) | Not assessable contractually; illustrative decline of 89.9% ($28,338m to $2,875m), holding strict net debt at $11,499m. |
| Debt increase that would breach it (approx.) | Not assessable contractually; illustrative $101,853m increase in strict net debt, holding LTM EBITDA at $28,338m. |

The illustrative maximum-leverage headroom uses the direction-correct ceiling formula: `(4.0x − 0.41x) / 4.0x = +89.9%`. The illustrative minimum-coverage headroom uses the direction-correct floor formula: `(36.52x − 3.0x) / 3.0x = +1,117.3%`. Neither result is a lender test, and neither may be used to score or declare covenant safety. `[Assumption, not from filings: role partial-data rule; Visa Q3 FY2026 Form 10-Q, pp.4, 17–18; calculation]`

## 4. Coverage / Covenant Read

On reported, non-net interest, Visa's LTM GAAP-derived EBITDA covers interest 36.52x and covers interest after total capex 34.50x; the latter is cushioned by cash conversion of 79.7% of EBITDA, though that rate has weakened from the prior annual range. `[Visa FY2025 Form 10-K, pp.60, 65; Visa Q3 FY2026 Form 10-Q, pp.4, 10; analyses/V_2026-09-23/earnings/06_earnings-quality.md, Section 2]`

The actual tightest covenant and its contractual breach point are **Not assessable** because the pool gives compliance statements but not the numerical maintenance terms, definitions, addback caps, springing trigger, or cure rights. The 89.9% assumed leverage cushion is only a scale check: it does not prove lender headroom. `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), p.18; Visa FY2025 Form 10-K, Note 10 (Credit Facility), p.84; data/V/manifest.json, frozen evidence-generation inventory]`
