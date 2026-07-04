# Coverage & Covenants — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions). **Fiscal year end:** December 31. **Primary period:** FY2025 (year ended December 31, 2025). **Most recent data:** LTM March 31, 2026 (Q1 2026 10-Q). **Listing:** Nasdaq, US SEC filer.

**Interest basis:** Gross interest expense (accrual basis, from the income statement). Interest paid (cash) is also shown for reference. Interest expense includes the interest component of finance lease obligations, consistent with how Amazon discloses it: "Interest expense was $541M (Q1 2025) and $800M (Q1 2026), primarily related to debt and finance leases." [Q1 2026 Form 10-Q (filed Apr 30, 2026), Note 5]

**EBITDA basis:** Reported GAAP EBITDA = operating income + depreciation and amortization. Amazon does not disclose a company-defined adjusted EBITDA. FY2025: $79,975M operating income + $65,756M D&A = $145,731M. Source: Capital IQ Income Statement / Cash Flow (FY2025 annual); cross-checked to FY2025 10-K (filed Apr 9, 2026), pp.27–28. The D&A figure includes $41,853M depreciation on PP&E and $23,903M operating lease amortization.

**Computation note:** All ratios in this report were produced by an executed Python snippet (results shown above each table). No ratio is based on mental arithmetic.

---

## 1. Coverage Ratios

All computations executed in Python; snippet output shown below each table.

**Python-verified inputs (FY2025):**
- EBITDA: $145,731M; EBIT: $79,975M; Gross capex: $131,819M; Interest expense: $2,274M
- `$145,731 / $2,274 = 64.1x` | `$79,975 / $2,274 = 35.2x` | `($145,731 − $131,819) / $2,274 = $13,912 / $2,274 = 6.1x`

| Ratio | FY2025 Value | LTM Mar-31-2026 | Source |
|---|---:|---:|---|
| EBITDA / interest expense | **64.1x** | 61.5x | EBITDA: Capital IQ / FY2025 10-K; Interest expense: Capital IQ Income Statement ($2,274M FY2025; $2,533M LTM) |
| EBIT / interest expense | **35.2x** | 33.7x | EBIT: FY2025 10-K, p.27 ($79,975M); LTM: Capital IQ LTM Mar-31-2026 ($85,422M / $2,533M) |
| (EBITDA − capex) / interest expense | **6.1x** | 1.9x | Capex: FY2025 10-K cash flow ($131,819M gross); LTM: Capital IQ ($151,003M). Numerator FY2025: $13,912M; LTM: $4,858M. Capex is gross and includes AI infrastructure (discussed below) |
| Fixed-charge coverage ratio (FCCR) | **0.8x** | Not computed (LTM capex data same source) | Denominator = interest $2,274M + operating lease payments (next 12M) $12,655M + finance lease principal $1,544M = $16,473M. Numerator = EBITDA − capex = $13,912M. $13,912 / $16,473 = 0.84x |

**Supplementary ratios (for context):**

| Supplementary Ratio | FY2025 Value | Note |
|---|---:|---|
| EBITDA / all fixed charges (no capex deduction) | 8.8x | $145,731 / $16,473; interest + lease payments only; capex excluded |
| CFO / all fixed charges | 8.5x | $139,514 / $16,473; best proxy for cash ability to cover interest + leases |
| Interest paid (cash) FY2025 | $1,949M | From FY2025 cash flow statement; lower than accrual ($2,274M) due to discount amortization timing |

**The FCCR of 0.8x requires a direct explanation.** It is below 1.0x because Amazon's gross capital expenditure of $131,819M in FY2025 — driven almost entirely by AWS AI infrastructure build — exceeds EBITDA on a net-of-capex basis when all lease charges are also counted in the denominator. This is intentional: management committed to $100B+ annual AI capex through at least 2026 against a confirmed AWS backlog of $364B (Q1 2026 10-Q). The FCCR as computed is a conservative stress measure, not a solvency signal, for two reasons: (1) EBITDA / interest at 64.1x and CFO / fixed charges at 8.5x confirm the company's earnings and operating cash stream easily cover its financial obligations by a factor of many times; (2) the capex is elective and discretionary — Amazon could cut growth capex without breaching any obligation. No covenant requires maintenance of a fixed-charge coverage ratio above any threshold (see Section 2).

**EBITDA cash quality (from `earnings/06_earnings-quality.md`):** CFO/EBITDA was 95.7% in FY2025 and 95.3% LTM — one of the highest conversion ratios for any large-cap company. EBITDA is fully cash-backed. The EBITDA coverage ratios (64.1x, 35.2x) apply without an earnings-quality caveat. Near-term strict FCF is negative (LTM: −$2.5B) due to AI capex, but this reflects a reinvestment choice, not an operating cash flow problem.

---

## 2. Covenant Inventory

**Primary finding: Amazon has no financial maintenance covenants on any disclosed debt instrument.**

The FY2025 10-K (Note 6, p.58) states explicitly: *"We are not subject to any financial covenants under the Notes."* This applies to all eight tranches of fixed-rate senior notes ($68.8B face value in aggregate). The Q1 2026 Form 10-Q (Note 5) repeats the same statement. The revolving credit facilities and commercial paper programs are referenced in both filings; neither filing discloses any maintenance financial covenant for those instruments. The credit agreements are described as containing standard negative-pledge and affirmative covenants, but no financial maintenance tests (minimum coverage ratio, maximum leverage ratio, minimum liquidity, or minimum net worth) are identified in the extracted pool text.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage — senior notes | **None** | 0.47x gross / net cash | N/A — no covenant | FY2025 10-K, Note 6, p.58: "not subject to any financial covenants under the Notes" |
| Min interest coverage — senior notes | **None** | 64.1x EBITDA/interest | N/A — no covenant | FY2025 10-K, Note 6, p.58 |
| Min liquidity / net worth — senior notes | **None** | $123B cash + investments | N/A — no covenant | FY2025 10-K, Note 6, p.58 |
| Springing covenant (revolver utilization trigger) | **Not disclosed** | $0 drawn on $15B revolver | Not assessable | Q1 2026 10-Q, Note 5: facility terms referenced but full covenant language not transcribed in extracted pool text |
| Equity cure rights | **Not applicable** | N/A (no maintenance covenants to cure) | N/A | FY2025 10-K, Note 6 |
| Change-of-control put / cross-default / rating trigger | Partial disclosure | N/A | Not assessable | Q1 2026 10-Q, Note 5: redemption rights referenced; full trigger terms not extracted. For an S&P AA-rated issuer, rating-trigger provisions are unlikely to be activated in any plausible scenario. |

**No maintenance covenants exist on the senior notes.** Under MODULE_RULES.md (Partial-Data Rule), true covenant headroom is "Not assessable" — but in this case, not because of missing data. The covenant disclosure is complete: the absence of maintenance covenants is a deliberate structural feature of investment-grade unsecured note documentation. Amazon's AA credit rating (S&P, Capital IQ Credit Health Panel, as of July 1, 2026) means its unsecured notes carry only incurrence-based restrictions and negative-pledge clauses standard for IG issuers, not maintenance tests.

**Labeled assumption for illustrative context only (as required by MODULE_RULES Partial-Data Rule):** A typical leveraged-loan or sub-IG revolving credit might carry a max net leverage covenant of 4.0–4.5x and a min interest coverage covenant of 2.5–3.0x. Against those hypothetical thresholds, Amazon's actual metrics (0.47x gross leverage; 64.1x interest coverage; $54.2B net cash on the broad basis) would represent headroom of approximately 89% on a hypothetical 4.5x leverage covenant and approximately 2,040% on a hypothetical 3.0x coverage covenant. These numbers are presented only to frame how far Amazon sits from typical IG covenant thresholds — they are not actual covenants and are **labeled assumption**, not disclosure.

### Covenant EBITDA Definition & Quality

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not applicable — no maintenance financial covenants exist on any instrument | FY2025 10-K, Note 6, p.58; Q1 2026 10-Q, Note 5 |
| Addbacks permitted (types) | Not disclosed — no covenant EBITDA calculation required | — |
| Addback caps / limits | Not disclosed | — |
| Is covenant EBITDA materially above reported EBITDA? | Not applicable | — |
| Addback illusion risk | None — no covenant to engineer around | — |

No covenant EBITDA addback analysis is needed or possible. The reported EBITDA of $145,731M (FY2025) is the relevant figure for economic coverage analysis. It is fully cash-backed (CFO/EBITDA 95.7%).

---

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | **None — no maintenance financial covenants exist** |
| Headroom on tightest covenant | Not assessable (no covenants to measure against) |
| EBITDA decline that would breach tightest covenant | Not applicable |
| Debt increase that would breach tightest covenant | Not applicable |
| Illustrative (labeled assumption — hypothetical IG 3.0x min coverage covenant) | EBITDA would need to fall 95.3% from $145,731M to below $6,822M to breach (= 3.0x × $2,274M interest) |
| Illustrative (labeled assumption — hypothetical 4.5x max gross leverage covenant) | Gross financial debt would need to rise from $68,851M to $655,790M (= 4.5x × $145,731M) to breach — an increase of $586,939M, or approximately 8.5x current debt |

**What would actually constrain Amazon operationally?** With no maintenance covenants, the binding constraint on debt capacity is not a covenant breach but market access and rating agency benchmarks. S&P maintains a AA rating (Credit Health Panel, July 1, 2026). S&P's AA/A thresholds for the Internet/Retail sector typically anchor to gross debt/EBITDA below 2.0–2.5x and interest coverage above 10x. At the current 0.47x gross leverage and 64.1x EBITDA/interest coverage, Amazon has space to more than triple its gross debt before approaching any S&P downgrade-relevant threshold — and even that would not trigger a covenant breach, since no maintenance covenants exist.

---

## 4. Coverage / Covenant Read

EBITDA of $145,731M covers interest expense of $2,274M by 64.1x (FY2025 reported; gross interest) — meaning earnings could fall 98.5% before Amazon could not cover its interest cost from EBITDA alone. EBIT covers interest 35.2x, and even after deducting all gross capex (including $131B of AI infrastructure investment), the residual (EBITDA minus capex) still covers interest 6.1x. The near-term strict free cash flow is negative, but this reflects a deliberate, management-confirmed reinvestment cycle against a $364B AWS backlog — not an impairment of the company's ability to service interest.

There is no tightest covenant to identify: Amazon's entire $68.8B of senior unsecured notes carries no financial maintenance covenants, confirmed explicitly in both the FY2025 10-K (Note 6, p.58) and the Q1 2026 Form 10-Q (Note 5). Covenant headroom is "Not assessable" by definition — not because information is absent, but because no maintenance test exists to measure against. This is a structural feature of investment-grade note documentation for an S&P AA-rated borrower, not a disclosure gap.

The fixed-charge coverage ratio of 0.8x — computed as (EBITDA minus total gross capex) divided by (interest plus next-12-month operating and finance lease obligations) — falls below 1.0x and signals that the AI capex surge, if sustained, consumes more than all EBITDA above lease costs. However, this capex is entirely discretionary and no covenant requires its continuation; Amazon could immediately restore the ratio above 8x (EBITDA/fixed charges without capex) by curtailing growth investment. The ratio that matters for default risk is EBITDA/interest at 64x, not the capex-inclusive FCCR.

---

## Covenant Headroom Score

**Covenant headroom / 100: Not assessable (no maintenance covenants exist).**

Per MODULE_RULES.md Score Cap Rules, where no maintenance covenants are disclosed, the covenant headroom score is "Not assessable." In this case the absence of covenants is a confirmed structural feature (investment-grade IG documentation), not a data gap. The module marks the score Not assessable as required. The absence of maintenance covenants is itself a positive solvency signal — lenders do not require ongoing compliance tests from this issuer — and is reflected positively in the overall solvency strength assessment.
