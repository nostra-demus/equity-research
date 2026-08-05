# Coverage & Covenants — SMPL

**Basis for all figures below:** Latest TTM = twelve months ended May 30, 2026 (FQ4 FY2025 + FQ1–FQ3 FY2026), unless a fiscal-year figure is explicitly labeled. Reporting currency USD, US GAAP. Gross debt $400.0M (face) / net debt $276.1M (strict basis, canonical per `01_capital-structure-and-leverage.md`) carries forward unchanged from `01`.

---

## 1. Coverage Ratios

Interest expense is **gross** (no net-interest disclosure is used or justified) and is derived because no single filing states a clean TTM figure directly: FY2025 10-K annual interest expense $23.249M, minus the 39 weeks ended May 31, 2025 ($19.1M, derived from the Q3 FY2026 10-Q's disclosed $3.2M YoY decrease against the $15.9M nine-month FY2026 figure), plus the 39 weeks ended May 30, 2026 ($15.9M) = **$20.0M TTM interest expense**. [FY2025 10-K, Income Statement; Q3 FY2026 10-Q, MD&A "Interest expense"] This is a derivation from filed quarterly deltas, not a single reported TTM line — flagged per the partial-data rule ("no interest-expense detail" proxy), though the underlying quarterly figures are all filing-sourced, not estimated from a coupon.

| Ratio | Value | Source |
|---|---:|---|
| Adjusted EBITDA / interest (TTM) | **11.7x** ($234.6M / $20.0M) | [Q3 FY2026 10-Q MD&A EBITDA reconciliation; `01_historical-financials.md` §2] |
| GAAP EBITDA / interest (TTM) | **not meaningful** (−$213.1M / $20.0M = −10.6x) | GAAP EBITDA is negative — driven by $391.9M of non-cash goodwill/brand impairment over the trailing four quarters, not an operating cash-flow problem. [`earnings/06_earnings-quality.md` §1] |
| GAAP EBIT / interest (TTM) | **not meaningful** (−$243.3M / $20.0M = −12.1x) | GAAP EBIT (Income from operations) TTM = −$243.3M. [`earnings/01_historical-financials.md` §2] |
| "Adjusted EBIT" / interest (TTM) — **derived, not company-reported** | **10.2x** ($204.4M / $20.0M) | The company does not reconcile an adjusted operating-income figure [`earnings/01_historical-financials.md` §4: "EBIT — Not separately reconciled by the company"]. This is computed as Adjusted EBITDA ($234.6M) minus TTM D&A ($30.2M, itself derived as GAAP EBITDA − GAAP EBIT). **Inference, not from filings.** |
| (Adjusted EBITDA − capex) / interest (TTM) | **10.3x** (($234.6M − $28.1M) / $20.0M) | Capex TTM $28.1M. [`earnings/01_historical-financials.md` §2] |
| (GAAP EBITDA − capex) / interest (TTM) | **not meaningful** (−$241.2M / $20.0M) | Same impairment distortion as above. |
| Fixed-charge coverage (Adjusted EBITDA basis) | **6.1x** — (($234.6M − $28.1M) / ($20.0M interest + $0.0M scheduled amortization + $13.6M TTM lease payments) = $206.5M / $33.6M) | Scheduled amortization: $0 — the Term Facility has no principal payments due in the 12 months following May 30, 2026 (bullet-style amortization under the amended Credit Agreement). [`01_capital-structure-and-leverage.md` §1] TTM lease payments $13.6M, derived as FY2025 total lease cost ($13.186M) minus the 39-week-FY2025 figure ($9.893M) plus the 39-week-FY2026 figure ($10.314M). [FY2025 10-K, Leases note; Q3 FY2026 10-Q, Note 8 (Leases)] |
| Fixed-charge coverage (GAAP EBITDA basis) | **not meaningful** (−$241.2M / $33.6M) | Same impairment distortion. |

**EBITDA basis stated:** Adjusted EBITDA is the company's own non-GAAP metric, defined as EBITDA further adjusted to exclude loss on impairment, stock-based compensation, business-transaction costs, purchase-price-accounting inventory step-up, integration expenses, term-loan transaction fees, restructuring, and other non-core expenses. [Q3 FY2026 10-Q, MD&A "EBITDA and Adjusted EBITDA"] GAAP EBITDA/EBIT are shown first in every row above per module convention, but both read "not meaningful" on a TTM basis because of the impairment; Adjusted EBITDA is the only usable coverage denominator right now.

**Is the EBITDA cash-backed?** No, not fully — and this is a real caveat, not a formality. Per `earnings/06_earnings-quality.md` §2, CFO / Adjusted EBITDA conversion has been falling: 80.1% (FY2024) → 64.1% (FY2025) → **62.9% on the Latest TTM** ($147.5M CFO vs $234.6M Adjusted EBITDA). Roughly 37% of the Adjusted EBITDA used as the coverage denominator above is not showing up as operating cash in the same period. The 11.7x EBITDA/interest and 10.3x (EBITDA−capex)/interest figures are therefore coverage on an accrual earnings base with weakening — not broken, but weakening — cash conversion, not coverage on a fully cash-verified number.

---

## 2. Covenant Inventory

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max total net leverage ratio (Revolving Credit Facility, **springing**) | ≤ 6.00 : 1.00 | 1.18x (strict net debt $276.1M / Adjusted EBITDA $234.6M) / 1.38x if lease-inclusive net debt ($324.6M) is used | **+80.3%** (strict) / **+77.0%** (lease-inclusive) if the test were live today — see §3, it is not currently active | [Q3 FY2026 10-Q, Note 5 (Long-Term Debt and Line of Credit)] |
| Min interest coverage | Not disclosed | n/a | n/a | Not found anywhere in the extracted 10-K/10-Q Note 5 text — the Credit Agreement is disclosed as carrying only the one financial covenant above. |
| Min liquidity / net worth | Not disclosed | n/a | n/a | Not found in the pool. |
| Springing-covenant trigger | Revolver draws > 30% of the $75.0M commitment ($22.5M) | $0.0M drawn (0% of commitment); $1.1M of letters of credit issued against the facility do not count as "credit extensions" for this test per the filing's own wording | The company has **$22.5M of additional undrawn headroom** before the leverage test even activates | [Q3 FY2026 10-Q, Note 5] |
| Equity cure rights (Y/N, limits) | Not disclosed | — | — | "Not disclosed in the data pool" — no equity-cure language located in the extracted Note 5 text. |
| Other — cross-default / change-of-control | Not disclosed distinctly for the Credit Agreement | — | — | "Not disclosed in the data pool" — the 10-K's risk-factor section references Delaware anti-takeover provisions generally, not a Credit-Agreement-specific change-of-control put or cross-default clause; per `00_solvency-data-triage.md`, resolving this would require the full Credit Agreement exhibit, which is not in the pool. |

Only **one** maintenance financial covenant is disclosed for this credit facility, and it is a springing test tied to revolver utilization, not an always-on covenant. This is a genuinely covenant-light structure, not a data gap — the 10-Q's Note 5 language ("The Revolving Credit Facility has a maximum total net leverage ratio equal to or less than 6.00:1.00 contingent on credit extensions in excess of 30%...") is explicit that no other financial maintenance covenant exists in the Credit Agreement as disclosed. [Q3 FY2026 10-Q, Note 5]

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not reproduced in the extracted 10-K/10-Q text. The filings state the leverage threshold (6.00:1.00) and the springing trigger (30% of commitments) but do not reprint the Credit Agreement's own "Consolidated EBITDA" definition or addback schedule used for that specific covenant test. | 10-Q (Jul-09-2026), Note 5 — confirmed absent per `00_solvency-data-triage.md` §3 |
| Addbacks permitted (types) | Unknown for the covenant test specifically. The company's separately disclosed P&L non-GAAP "Adjusted EBITDA" (used in Section 1 above) excludes loss on impairment, stock-based compensation, business-transaction costs, inventory step-up, integration expenses, term-loan fees, and restructuring — but nothing in the pool confirms this P&L metric is the same definition the lenders use for the covenant test. **Inference, not from filings.** |
| Addback caps / limits | Not disclosed. |
| Is covenant EBITDA materially above reported EBITDA? | Almost certainly, if the covenant definition tracks the P&L Adjusted EBITDA (which excludes a $391.9M impairment) versus GAAP EBITDA of −$213.1M TTM — but this is not confirmed, since the credit-agreement-specific definition is not in the pool. **Inference, not from filings.** |

**Headroom-quality flag:** because the covenant-EBITDA addback definition is unconfirmed, the 80.3% headroom figure in Section 3 below is computed on the company's disclosed Adjusted EBITDA as a proxy, not on a confirmed covenant-EBITDA figure. Per the module's Covenant Definition Rigor hard rule, this caps covenant-headroom confidence — flag "addback illusion" risk as unresolved, not cleared. The single highest-value missing document remains the full Credit Agreement exhibit (per `00_solvency-data-triage.md`).

---

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | Max total net leverage ratio (springing, ≤6.00:1.00) — the only maintenance financial covenant disclosed |
| Is the covenant currently active/tested? | **No.** It springs only when revolver draws exceed 30% of the $75.0M commitment ($22.5M). The revolver is undrawn ($0.0M) as of May 30, 2026, so the test is not currently live. [Q3 FY2026 10-Q, Note 5] |
| Headroom on tightest covenant, if it were tested today (%) | **+80.3%** = (6.00 − 1.18) / 6.00, using the canonical strict net leverage of 1.18x (net debt $276.1M / Adjusted EBITDA $234.6M); **+77.0%** on the lease-inclusive 1.38x reading. Both are indicative, not a live compliance test, and both rest on the unconfirmed covenant-EBITDA definition flagged above. |
| Adjusted EBITDA decline that would breach it, holding net debt fixed at $276.1M | Adjusted EBITDA would have to fall to roughly **$46.0M** (from $234.6M TTM) to reach 6.00x — an **~80% decline**, which exceeds even the module's most severe standard stress haircut (−60%, which would leave Adjusted EBITDA at ~$93.8M and net leverage at ~2.9x, still well inside the threshold). [Computed: $276.1M / 6.00 = $46.0M; ($234.6M − $46.0M) / $234.6M = 80.4%] |
| Net debt increase that would breach it, holding Adjusted EBITDA fixed at $234.6M | Net debt would have to rise to roughly **$1,407.6M** (from $276.1M) — a **+$1,131.5M (+410%)** increase — to reach 6.00x on its own. [Computed: 6.00 × $234.6M = $1,407.6M] |

Both single-variable breach paths are extreme and, on their own, not plausible in the ordinary course — this covenant is not the company's near-term risk. The more relevant near-term fact is structural, not numerical: **the covenant does not even apply until the revolver is drawn past $22.5M**, and the revolver is currently undrawn. A large, sudden draw on the revolver (e.g., to fund a debt-financed acquisition or buyback) would be the actual event that first turns this covenant "on," well before leverage itself would need to move 80% to breach it.

---

## 4. Coverage / Covenant Read

Earnings on the company's own Adjusted EBITDA cover interest by 11.7x and fixed charges (interest + $0 scheduled amortization + $13.6M TTM lease payments) by 6.1x — but GAAP EBITDA and GAAP EBIT are both negative TTM (−$213.1M and −$243.3M) because of $391.9M of non-cash impairment over the last four quarters, so every coverage number here rests on a non-GAAP earnings base whose cash conversion has fallen from 80% to 63% over the same period (`earnings/06`), not a fully cash-verified one. The only maintenance financial covenant disclosed — a 6.00x max net-leverage test — carries a wide 80.3% indicative headroom against actual net leverage of 1.18x, but it is a springing covenant that is not even currently active (revolver undrawn, versus a $22.5M activation threshold), and the covenant's own EBITDA addback definition is not confirmed in the pool, so that headroom figure is a proxy on disclosed Adjusted EBITDA, not a verified covenant-EBITDA reading. Nothing here threatens near-term covenant compliance, but the coverage cushion is being built on an earnings number (Adjusted EBITDA) that is both shrinking (16.9% margin, a multi-year trough) and converting to cash less reliably than it did two years ago — the risk to watch is the trend in the numerator, not the covenant math itself.
