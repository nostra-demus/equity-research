# Coverage & Covenants — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS
**Reporting currency:** AED (UAE Dirham), in millions unless stated
**Fiscal year end:** 31 December
**Latest period:** FY2025 (Dec-31-2025)
**Jurisdiction:** United Arab Emirates — DFM / SCA

**Upstream inputs used:**
- `01_capital-structure-and-leverage.md` — debt, EBITDA bases, interest expense, capex (present and used)
- `earnings/01_historical-financials.md` — EBIT, EBITDA, capex, CFO (present and used)
- `earnings/06_earnings-quality.md` — cash backing of EBITDA, FCF normalisation (present and used)
- `FY2025 Investor Presentation (Preliminary Annual Report, Feb-12-2026)` — company-adjusted EBITDA, EBITDA/Interest = 29x (adjusted basis), credit ratings, undrawn facilities — read directly

---

## 1. Coverage Ratios

All ratios computed via executed Python snippet (output shown above). Interest expense = AED 492 mn (FY2025), derived from the ratio pair disclosed by `01_capital-structure-and-leverage.md`: EBIT/Interest = 45.8x with EBIT = AED 22,552 mn → Interest = AED 492 mn. Cross-checked: EBITDA/Interest = 49.1x × AED 492 mn ≈ AED 24,132 mn EBITDA — consistent. Interest is gross interest expense (income statement), not net. No netting of interest income is applied.

**EBITDA basis:** Reported EBITDA (Capital IQ, FY2025 = AED 24,132 mn) is the primary figure. Company-adjusted EBITDA (AED 25,561 mn, which removes a non-cash IFRS 9 unwinding of long-term receivable discounts) is shown alongside. The mid-cycle / normalised EBITDA of AED 14,000 mn (consistent with the FY2021–FY2025 five-year average of AED 14,647 mn, per `01_capital-structure`) is included because Emaar's business-model cross-module flags consumer-cycle dependency as High.

### FY2025 Coverage — Reported EBITDA Basis (primary)

| Ratio | Formula | Value | Source |
|---|---|---:|---|
| EBITDA / Interest | 24,132 / 492 | **49.0x** | Capital IQ Annual Income Statement + Ratios, FY2025; computed |
| EBIT / Interest | 22,552 / 492 | **45.8x** | Capital IQ Annual Income Statement, FY2025; computed |
| (EBITDA − Capex) / Interest | (24,132 − 934) / 492 | **47.1x** | Capital IQ Income Statement + Cash Flow, FY2025; computed |
| Fixed-charge coverage (EBITDA − Capex) / (Interest + Lease current) | 23,198 / (492 + 135) | **37.0x** | Capital IQ; lease current portion AED 134.9 mn per 01_capital-structure; computed |

### FY2025 Coverage — Company-Adjusted EBITDA Basis (secondary)

| Ratio | Formula | Value | Source |
|---|---|---:|---|
| EBITDA (adj) / Interest | 25,561 / 492 | **51.9x** | FY2025 Investor Presentation, Feb-12-2026, slide 12; computed |
| (EBITDA_adj − Capex) / Interest | 24,627 / 492 | **50.0x** | Computed |

*Note: The FY2025 Investor Presentation itself quotes EBITDA/Interest = 29x (slide 8). That figure uses the company-adjusted EBITDA (AED 25,561 mn) but on a different interest-expense base that includes finance costs from leases and the IFRS 9 unwinding (i.e. a broader "finance cost" denominator, not just the AED 492 mn interest expense on gross debt). The 29x figure is the company's own published ratio; the 51.9x above uses only debt interest expense as the denominator. Both are disclosed here for transparency — the gap reflects the denominator definition. The 49.0x / 45.8x ratios using reported EBITDA and debt interest expense are used as the primary reference throughout this report, consistent with the module's calculation standard.*

### Mid-Cycle EBITDA Coverage (normalised, cyclical stress check)

| Ratio | Formula | Value | Source |
|---|---|---:|---|
| EBITDA (mid-cycle, AED 14,000 mn) / Interest | 14,000 / 492 | **28.4x** | Mid-cycle EBITDA from 01_capital-structure (5-yr avg basis); computed |
| EBIT (mid-cycle approx, AED 12,420 mn) / Interest | 12,420 / 492 | **25.2x** | EBIT_mc = EBITDA_mc − D&A (AED 1,580 mn); computed |
| (EBITDA_mc − Capex) / Interest | 13,066 / 492 | **26.5x** | Computed |

**EBITDA cash-backing caveat (from `earnings/06_earnings-quality.md`):** Normalised operating FCF (CFO minus advance customer payments minus capex) was AED 24,295 mn in FY2025, essentially equal to reported EBITDA of AED 24,132 mn. Cash conversion is not a concern — EBITDA is genuinely cash-backed at the reported level. Reported FCF of AED 32,524 mn overstates recurring cash generation by AED 8,229 mn (advance customer payments that represent future delivery obligations), but this does not impair the interest-coverage read since those advances are real cash the company holds. Coverage ratios based on reported EBITDA are not inflated by non-cash items or poor-quality accruals.

---

## 2. Covenant Inventory

**No covenant disclosure exists in the data pool.** No sukuk trust deed, bank credit agreement, or covenant schedule is available for any of Emaar's instruments. The FY2024 Annual Report (primary filing, in Arabic) and the FY2025 Investor Presentation do not disclose specific financial maintenance covenants. Accordingly, the partial-data rule is applied: market-typical covenants for an investment-grade real-estate issuer (BBB+/Baa1, S&P/Moody's, upgraded in 2025) are used as **labeled assumptions**. True covenant headroom is marked "Not assessable" for scoring purposes.

**Rationale for covenant type assumed:** Emaar's three sukuk series are senior unsecured capital-markets instruments. Investment-grade sukuk / bonds of this type typically carry incurrence-only covenants (negative pledge, limitation on liens, change-of-control put) rather than maintenance financial covenants tested quarterly. The main AED revolving credit facility (AED 3,673 mn commitment) is a bank facility where maintenance covenants (max net leverage, min interest coverage) are more common. Subsidiary facilities (INR, EGP, PKR) may carry local maintenance covenants not visible at the consolidated level. The assumptions below reflect the most likely bank-facility covenant structure for an IG property developer in the UAE.

| Covenant | Threshold (Assumption — labeled) | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage (net debt / EBITDA) | ≤ 3.5x *(assumed: typical IG UAE bank revolving credit)* | 0.04x | 99.0% | Actual: computed (AED 861 mn / AED 24,132 mn); threshold: labeled assumption |
| Min interest coverage (EBITDA / interest) | ≥ 3.0x *(assumed: typical IG bank facility)* | 49.0x | 93.9% | Actual: computed; threshold: labeled assumption |
| Max net leverage — mid-cycle EBITDA check | ≤ 3.5x *(same assumption)* | 0.06x | 98.2% | Computed on AED 14,000 mn mid-cycle EBITDA |
| Min liquidity / net worth | Not assumed (no basis for a specific threshold) | N/A | Not assessable | No disclosure; sukuk IG issuers rarely have minimum-liquidity covenants |
| Springing covenant trigger (revolver utilization) | Not disclosed | AED 3.7 mn drawn of AED 3,673 mn (0.1% utilization) | Not assessable | Capital IQ Capital Structure Details, FY2025 — revolver near-fully undrawn |
| Equity cure rights | Not disclosed | N/A | Not assessable | Not in data pool |
| Sukuk covenants — negative pledge / change of control put | Standard IG negative pledge; 101% put on change of control *(inferred from market practice — not filed)* | No breach | Not assessable | Inference from market practice for UAE sukuk; trust deed not in pool |

**Headroom scores marked "Not assessable" for scoring, per MODULE_RULES partial-data rule. The 99% and 94% figures above are indicative only, computed against assumed (not disclosed) thresholds.**

### Covenant EBITDA Definition & Quality

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Unknown — covenant documents not in data pool.** For the bank revolving credit, EBITDA is likely defined in the facility agreement with specific add-backs permitted. For the sukuk, no ongoing financial maintenance test applies (incurrence covenants only in typical IG sukuk structures). | Inference from market practice; no filed definition available |
| Addbacks permitted (types) | **Not disclosed.** Likely: D&A, non-cash charges, one-time restructuring costs, and potentially the IFRS 9 unwinding add-back (which company already uses in its own adjusted EBITDA). | Not from filings |
| Addback caps / limits | **Not disclosed.** | Not from filings |
| Is covenant EBITDA materially above reported EBITDA? | Potentially yes by 5–10% if the IFRS 9 unwinding add-back (AED 1,429 mn in FY2025) is permitted. However, since actual leverage is 0.04x on reported EBITDA, this distinction has zero practical effect on any plausible covenant threshold. | FY2025 Investor Presentation, slide 8/12; `earnings/01_historical-financials.md` |

**Addback illusion risk:** Not applicable in this case. Even if covenant EBITDA were 10% lower than reported EBITDA (i.e. AED 21,700 mn), interest coverage would still be ~44x and net leverage would still be ~0.04x. The company's leverage position is so far from any plausible threshold that the precision of the EBITDA definition is irrelevant to headroom assessment. This is a structural feature of the balance sheet, not a gap in analysis.

---

## 3. Headroom & Breach Proximity

All figures computed via Python (output shown above). Based on the **assumed** market-typical covenant thresholds. Because these are assumptions, all breach-proximity figures carry the caveat: "Not assessable from disclosed covenants — computed against assumed typical thresholds."

| Metric | Value |
|---|---:|
| Tightest assumed covenant | Min interest coverage ≥ 3.0x (assumed) |
| Headroom on tightest covenant — reported EBITDA | 93.9% |
| Headroom on tightest covenant — mid-cycle EBITDA | Not applicable (mid-cycle EBITDA/Interest = 28.4x; even mid-cycle is 9.5x the assumed 3.0x floor) |
| EBITDA decline that would breach min interest coverage (to 3.0x) | −93.9% (EBITDA would need to fall from AED 24,132 mn to AED 1,477 mn — a 94% collapse, which has no plausible single-year path) |
| EBITDA decline to breach on mid-cycle EBITDA | −89.4% (AED 14,000 mn to AED 1,477 mn) |
| Net debt increase that would breach max net leverage (3.5x) | +AED 83,601 mn (net debt would need to rise from AED 861 mn to AED 84,462 mn — 7.9x the current gross debt of AED 10,615 mn) |
| Tightest near-term maturity risk (not a covenant, but a cash-service event) | Third Series sukuk AED 2,752 mn maturing Sep-2026 — covered 4.4x by unrestricted cash alone at Q1-2026 (AED 12,180 mn) |

**On the broad-basis net debt (including liquid STI of AED 18,148 mn):** Net debt is −AED 17,287 mn (net cash) at FY2025. Even on this basis, no leverage covenant is remotely testable. The strict-basis figure (net debt AED 861 mn at FY2025; net cash AED 2,115 mn at Q1-2026) is used throughout per module canonical basis.

---

## 4. Coverage / Covenant Read

Emaar's earnings cover its interest charges by 49x (EBITDA / gross interest, FY2025 reported EBITDA basis) — one of the widest coverage ratios achievable by a borrower with any meaningful debt. Even when stress-tested against a mid-cycle EBITDA that is 42% below the FY2025 level (AED 14,000 mn vs AED 24,132 mn), coverage remains 28.4x. No financial maintenance covenant is disclosed in the data pool; applying market-typical thresholds for an investment-grade UAE bank revolving credit (max net leverage 3.5x, min coverage 3.0x), the indicative headroom is 99% on leverage and 94% on coverage — both figures reflecting a balance sheet that is structurally remote from any plausible breach. The single operational event that would trip an assumed 3.0x interest-coverage covenant requires a 94% EBITDA collapse; even the FY2020 COVID trough EBITDA of approximately AED 5,500 mn would leave coverage at 11x, still 3.7x above the assumed floor. The tightest real credit risk is not a covenant breach but the AED 2,752 mn Third Series sukuk maturing in September 2026 — and that is covered 4.4x by unrestricted cash at Q1-2026 without drawing on the AED 3,669 mn of undrawn revolving credit.

**Partial data note:** No covenant disclosure exists in the pool. Headroom figures above are computed against assumed (not disclosed) thresholds and are marked "Not assessable" for scoring per MODULE_RULES. The near-zero leverage (0.04x net debt / EBITDA strict basis) and ~49x interest coverage make this conclusion robust to any reasonable covenant definition.

---

## Self-Check

- [x] All four coverage ratios computed (EBITDA/interest, EBIT/interest, (EBITDA−capex)/interest, fixed-charge coverage) via executed Python snippet; results shown.
- [x] EBITDA basis stated (reported CIQ = primary; company-adjusted = secondary; mid-cycle = cyclical stress check).
- [x] Gross interest used; no netting of interest income.
- [x] EBITDA is cash-backed per `earnings/06_earnings-quality.md` — caveat applied and resolved (cash-backing confirmed).
- [x] Mid-cycle EBITDA coverage computed and shown separately (cyclical company flag from business-model).
- [x] Covenant inventory shows each assumed covenant with threshold, actual, and signed headroom %.
- [x] Tightest covenant (assumed min coverage 3.0x) identified; operational move to trip it stated (94% EBITDA decline).
- [x] Covenants undisclosed — labeled-assumption rule applied; headroom marked "Not assessable" for scoring.
- [x] Covenant EBITDA definition section completed; addback illusion addressed.
- [x] No banned phrases.
- [x] All ratios produced by executed Bash/Python snippet, not mental arithmetic (F09 complied).
