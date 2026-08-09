# Coverage & Covenants — UBER

Reporting standard: US GAAP. Reporting currency: USD, $ millions unless noted. All figures are trailing-twelve-months (TTM, Jul-2025–Jun-2026) unless stated otherwise, to match the leverage base `01_capital-structure-and-leverage.md` uses. Gross interest expense is used throughout (Uber discloses interest expense and interest income as separate income-statement lines — net interest is not used here) [Q2 FY26 10-Q, Condensed Consolidated Statements of Operations].

## 1. Coverage Ratios

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | **16.2x** | Computed: 7,474 / 462 |
| EBIT / interest | **14.5x** | Computed: 6,700 / 462 |
| (EBITDA − capex) / interest | **15.5x** | Computed: (7,474 − 308) / 462 |
| Fixed-charge coverage | **7.8x** | Computed: (7,474 − 308) / (462 + 0 + 458) — see formula note below |

**EBITDA basis:** reported/unadjusted TTM EBITDA of $7,474M (income from operations + total D&A) — the same basis `01_capital-structure-and-leverage.md` and `earnings/01_historical-financials.md` use, **not** Uber's company-defined "Adjusted EBITDA" ($8,730M, last disclosed for FY2025 only — the company stopped publishing quarterly Adjusted EBITDA after Q4 FY2025) [earnings/01_historical-financials.md §4]. Using unadjusted EBITDA is the more conservative choice here (§4 conservative default) given that gap.

**Interest basis:** gross interest expense, TTM. Built from FY2025 full-year interest expense ($440M) minus H1 FY2025 interest expense ($213M) plus H1 FY2026 interest expense ($235M) = **$462M TTM** [FY25 10-K, Item 8, Consolidated Statements of Operations, "Interest expense $(523) $(440)" three-year comparison table; Q2 FY26 10-Q, Condensed Consolidated Statements of Operations, "Interest expense (108) (127) (213) (235)" for Q2 FY25/Q2 FY26/H1 FY25/H1 FY26]. This is an executed-calculation, not a proxy — actual quarterly interest-expense figures are disclosed in the filings, so the "no interest-expense detail" partial-data rule does not apply.

**Fixed-charge coverage formula used:** (EBITDA − capex) / (gross interest + scheduled debt amortization + lease payments). Two items need explaining:
- **Scheduled debt amortization = $0.** Every Uber bond (2029–2054 Senior Notes) and the 2026 Term Loan are bullet-maturity instruments — principal is due in full at maturity, with no recurring amortization schedule disclosed [Q2 FY26 10-Q, Note 5]. There is therefore no recurring "scheduled amortization" fixed charge to add in a trailing 12-month calculation. This differs from a near-term *maturity* (the $2.0B Term Loan due Dec-2026, a one-time bullet within the next 12 months from the Jun-30-2026 balance-sheet date) — that belongs in `02_maturity-wall-and-refinancing` (not yet run in this parallel layer), not in a trailing fixed-charge ratio.
- **Lease payments = $458M**, using the most recent full fiscal year (FY2025) as a proxy — finance lease amortization of ROU assets ($153M) + finance lease interest ($17M) + operating lease cost ($288M) [FY25 10-K, Item 8, Leases note]. A Jun-2026-TTM lease-cost breakdown was not located in the Q2 FY26 10-Q text extracted for this pool (the Q2 10-Q does not repeat the full leases note), so the FY2025 annual figure is used as the closest available proxy and flagged as such.

**Is EBITDA cash-backed?** Yes — `earnings/06_earnings-quality.md` finds CFO/EBITDA of 160.0% (FY2025) and 201.8% (FY2024), both far above the 100% mark, driven by a structurally negative working-capital cycle and a growing insurance-reserve float, not aggressive revenue recognition [earnings/06_earnings-quality.md §1–2]. The EBITDA used for coverage above is not a paper number — actual cash generation exceeds it. No caveat is needed on the coverage ratios for cash-backing quality.

**Read: coverage is very high on every measure** (EBITDA/interest 16.2x, EBIT/interest 14.5x, fixed-charge coverage 7.8x) — this reflects a lightly levered balance sheet (net debt/EBITDA 1.09x per `01`) carrying $462M of TTM interest against $7,474M of TTM EBITDA, not an aggressive credit that happens to be covered. The coverage picture is not the constraint on this balance sheet; see Section 4 for the caveat this creates for the *proximity* read.

## 2. Covenant Inventory

**No maintenance financial covenant is disclosed anywhere in the Q2 FY26 10-Q or FY25 10-K debt notes.** Every Uber debt instrument in the pool carries only "customary" covenants, and three of the largest instruments explicitly carry no financial covenants at all:

| Instrument | Covenant language found | Type | Maintenance financial ratio disclosed? | Source |
|---|---|---|---|---|
| 2026 Term Loan ($2.0B drawn) | "Customary affirmative and negative covenants and events of default, including restrictions on certain subsidiary indebtedness, liens, mergers and other fundamental changes, and the use of proceeds." "We were in compliance with all applicable covenants as of June 30, 2026." | Incurrence-style, negative covenants | **No** — no numeric leverage or coverage test found in the extracted text | [Q2 FY26 10-Q, Note 5] |
| Senior Notes (2029/2030/2031/2034/2035/2054, $7.5B combined) | Indentures "contain customary covenants restricting our and certain of our subsidiaries' ability to incur debt and incur liens, as well as certain financial covenants specified in the indentures." "We were in compliance with all covenants as of June 30, 2026." | Incurrence-style (limitation on liens / indebtedness); no numeric maintenance ratio identified in the extracted text | **No** — text references "certain financial covenants" without quoting a threshold | [Q2 FY26 10-Q, Note 5] |
| Credit Agreement (revolver, $5.0B commitment, $0 drawn) | "Customary covenants restricting our and certain of our subsidiaries' ability to incur debt, incur liens, and undergo certain fundamental changes." "We were in compliance with all covenants in the Credit Agreement." | Incurrence-style, negative covenants | **No** | [Q2 FY26 10-Q, Note 5] |
| 2028 Convertible Notes ($1.725B) | "Does not contain any financial or operating covenants or restrictions on the payments of dividends, the incurrence of indebtedness or the issuance or repurchase of securities." | None | **No — explicitly none** | [Q2 FY26 10-Q, Note 5] |
| 2028 Exchangeable Senior Notes ($1.125B principal, Aurora-share-pledge secured) | "Does not contain any financial or operating covenants or restrictions on the payments of dividends, the incurrence of indebtedness or the issuance or repurchase of securities." | None | **No — explicitly none** | [Q2 FY26 10-Q, Note 5] |

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | Not disclosed | Net debt (strict)/EBITDA = 1.09x | **Not assessable** | No numeric threshold found — see below |
| Min interest coverage | Not disclosed | EBITDA/interest = 16.2x | **Not assessable** | No numeric threshold found — see below |
| Min liquidity / net worth | Not disclosed | — | **Not assessable** | No such covenant found in the pool |
| Springing covenant trigger (e.g. revolver utilization threshold) | Not disclosed | Revolver drawn: $0 of $5.0B (0% utilization) | **Not assessable — no springing-covenant language found** | [Q2 FY26 10-Q, Note 5] |
| Equity cure rights (Y/N, limits) | **Not applicable** — no maintenance financial covenant exists to cure | — | n/a | Inference from the absence of any maintenance ratio in the extracted covenant text |
| Cross-default | Generic risk-factor language only: "Any default under our debt arrangements could require that we repay our loans immediately." No specific cross-default threshold (e.g., a minimum dollar amount) is quoted in the extracted text. | — | Not disclosed in the data pool | [Q2 FY26 10-Q, MD&A — Liquidity risk factors] |

**Partial-data rule applied (per the module's covenant-disclosure rule).** No maintenance financial covenant — no numeric max-leverage or min-coverage test — is disclosed for any Uber debt instrument in this pool. This module therefore applies a **labeled assumption**, using the rule's own worked example (max net leverage 4.0–4.5x for a leveraged borrower; min interest coverage 2.0–3.0x), and marks true covenant headroom **"Not assessable"** for scoring:

| Indicative covenant (labeled assumption, not from filings) | Threshold | Actual | Indicative headroom (direction-aware) |
|---|---:|---:|---:|
| Max net leverage (illustrative) | 4.0x | 1.09x | (4.0 − 1.09) / 4.0 = **+72.7%** |
| Max net leverage (illustrative) | 4.5x | 1.09x | (4.5 − 1.09) / 4.5 = **+75.7%** |
| Min interest coverage (illustrative) | 2.0x | 16.2x | (16.2 − 2.0) / 2.0 = **+708.9%** |
| Min interest coverage (illustrative) | 3.0x | 16.2x | (16.2 − 3.0) / 3.0 = **+439.2%** |

**This is an assumption, not a disclosed fact.** *Inference, not from filings.* One important caveat cuts the other way from the usual partial-data case: applying a leveraged-borrower's typical 4.0–4.5x maintenance covenant to Uber is itself conservative-*understating* real headroom, because Uber's actual debt structure — entirely unsecured, guaranteed senior notes and a covenant-lite term loan/revolver, all with only incurrence-style (not maintenance) covenants — is the profile of an investment-grade-style issuer, not a leveraged-loan borrower who would typically be subject to a quarterly-tested maximum leverage ratio in the first place. No specific credit rating (S&P/Moody's/Fitch/CRISIL-equivalent) was found anywhere in the data pool for Uber, so this cannot be confirmed against a stated rating — it is inferred from the covenant structure itself, and flagged as such.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Not applicable / not assessable** — no maintenance-covenant EBITDA definition exists in the pool because no maintenance financial covenant is disclosed | — |
| Addbacks permitted (types) | Unknown | — |
| Addback caps / limits | Unknown | — |
| Is covenant EBITDA materially above reported EBITDA? | Cannot be judged — no covenant-EBITDA definition to compare | — |

Because no covenant EBITDA definition exists to examine, the "addback illusion" risk this hard rule exists to catch cannot arise here — there is no covenant-specific EBITDA being manipulated, because there is no maintenance covenant being tested. This is a genuinely different situation from "covenant EBITDA is undisclosed but a covenant exists" — here, the covenant itself is not disclosed as existing. Per the module's score-cap table, covenant headroom is scored **"Not assessable"** and Overall usefulness for this agent is capped at 75.

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | **None disclosed.** No maintenance financial covenant (max leverage, min coverage, min liquidity/net worth) was found for any Uber debt instrument in this pool. Using the indicative labeled-assumption covenants above (Section 2), the tighter of the two illustrative constructs is the max-net-leverage proxy (+72.7% headroom at 4.0x), because it sits far closer to breach than the min-coverage proxy (+708.9% headroom at 2.0x) — but neither is a real, disclosed covenant. |
| Headroom on tightest covenant (%) | **Not assessable** (no disclosed covenant); indicative illustrative figure +72.7% at a 4.0x assumed max net leverage |
| EBITDA decline that would breach it (approx.) | Using the illustrative 4.0x max-net-leverage construct: net debt (strict) $8,163M ÷ 4.0x = $2,041M EBITDA breakeven → EBITDA would need to fall from $7,474M to $2,041M, a **72.7% decline**, before the illustrative covenant would be breached at today's debt level. Computed: (7,474 − 2,041) / 7,474 = 72.7%. |
| Debt increase that would breach it (approx.) | Holding TTM EBITDA at $7,474M, net debt would need to rise to 4.0 × 7,474 = $29,896M before the illustrative covenant would be breached — an increase of **$21,733M (+266%)** from the current $8,163M net debt (strict). Computed: 29,896 − 8,163 = 21,733. For scale: the pending €14.2 billion (≈$15.3bn) Delivery Hero acquisition bridge facility [01_capital-structure-and-leverage.md §1], if fully drawn on top of the current balance with EBITDA unchanged, would take pro-forma net debt to ≈$23,463M and pro-forma net leverage to ≈3.14x — still under the illustrative 4.0x threshold (indicative headroom ≈21.5%), but a real and material narrowing from today's 72.7%. Computed: (8,163 + 15,300) / 7,474 = 3.14x; (4.0 − 3.14)/4.0 = 21.5%. This is a forward flag only — it does not incorporate the added interest expense a bridge-to-term-loan refinancing would carry, which belongs to `06_downside-stress-test`, not this agent. |

## 4. Coverage / Covenant Read

Earnings cover fixed charges by a wide margin on every measure computed here — EBITDA/interest of 16.2x, EBIT/interest of 14.5x, and fixed-charge coverage of 7.8x, all built from cash-backed EBITDA (CFO ran 160–202% of EBITDA in FY2023–FY2025 per `earnings/06_earnings-quality.md`) against a modest $462M of TTM gross interest expense on a $13,033M gross debt stack carrying a low blended coupon. But there is no maintenance financial covenant disclosed for any Uber debt instrument in this pool to test that coverage against — every bond, the term loan, and the revolver carry only incurrence-style negative covenants (restrictions on new secured debt, liens, and fundamental changes), and two of the largest instruments (the 2028 Convertible Notes and the 2028 Exchangeable Senior Notes, $2.85B combined) explicitly state they carry no financial or operating covenants at all. Using the module's own labeled-assumption proxy (a 4.0–4.5x max net leverage test, typical for a leveraged borrower — which Uber, at 1.09x net leverage with an unsecured, incurrence-covenant debt structure, is not), indicative headroom is a wide +72.7% to +75.7%, and EBITDA would need to fall ~73% (or net debt would need to roughly triple) before that illustrative threshold would bite; this is presented as a labeled inference, not a fact, and true covenant headroom is scored **"Not assessable"** per the partial-data rule. The one real, quantified thing that would meaningfully narrow this picture is not a covenant at all but the pending €14.2 billion Delivery Hero bridge facility — if fully drawn, pro-forma net leverage rises to ≈3.14x, still comfortably below the illustrative 4.0x line but a genuine step toward it that `06_downside-stress-test` should carry forward explicitly.
