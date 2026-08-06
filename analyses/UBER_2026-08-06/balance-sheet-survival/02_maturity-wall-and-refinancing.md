# Maturity Wall & Refinancing — UBER

**Reporting currency:** USD (millions unless stated). **Reporting standard:** US GAAP. **Source-pool caveat (carried from `00_solvency-data-triage.md` / `01_capital-structure-and-leverage.md`):** no primary SEC filing (10-K/10-Q) is physically present in `data/UBER/`; every figure below is Capital IQ's vendor transcription of Uber's FY2025 10-K (filed 2026-02-13) and Q2 FY2026 results (released 2026-08-05) — cited as "CIQ export," never as "10-K." No `ciq_facts.json` sidecar exists for this run.

**Anchor from `01`:** gross debt (canonical, Jun-30-2026) = **$14,731mm**; net debt (strict) = **$9,861mm**. This agent reconciles its own maturity build to that $14,731mm total.

## 1. Maturity Schedule

The most recent **instrument-level** maturity detail in the pool is the FY2025 year-end (Dec-31-2025) debt note [CIQ export, Capital Structure Details tab; Capital Structure Summary tab, "Fixed Payment Schedule"], which totals $12,302mm and reconciles exactly to `01`'s FY2025 gross-debt figure. Between FY2025 and the latest balance sheet (Jun-30-2026), gross debt rose $2,429mm to $14,731mm — and **critically, "Current Portion of Long-Term Debt" jumped from $0 (FY2025) to $1,997mm (Jun-30-2026)** [CIQ export, Balance Sheet tab], even though no bond in the FY2025 instrument table matures before May-2028. This $1,997mm is **not itemized by instrument anywhere in the pool** (no Q2 FY2026 Capital Structure Details tab exists). Cross-checking the balance-sheet roll-forward (Long-Term Debt +$205mm — consistent with normal zero-coupon-note accretion on the existing 2028 bonds, not a maturity shift; Long-Term Leases +$356mm; Current Leases −$129mm) shows the existing $10,600mm bond stack did **not** move to current — the $1,997mm is additive, new short-term-dated debt raised during H1 FY2026. Cash-flow evidence is consistent with new short-term financing: LTM Jun-30-2026 gross debt issued was $6,229mm vs. $3,359mm for FY2025 alone [CIQ export, Cash Flow tab], and the increase roughly coincides with the ~$4,000mm spent on Delivery Hero open-market stake purchases in Q2 FY2026 [`01_capital-structure-and-leverage.md`; Q2 FY2026 transcript, p.12]. **The specific facility, its rate, and lender are not disclosed in this pool — this is inference, not from filings**, and is the single largest open question in this maturity wall.

Given that, the table below anchors the **within-12-months** bucket to the actual, current Jun-30-2026 balance-sheet classification (most conservative, most current), and anchors **Years 2 onward** to the last fully itemized (FY2025-vintage) bond/lease schedule — labelled, because it has not been updated for the $2,429mm of H1 FY2026 balance-sheet change. Bond amounts are shown at **principal** (not net of the ~$79mm original-issue discount).

| Period | Amount Due ($mm) | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (by ~Jun-2027) | 2,175 | 14.8% | $1,997mm unidentified new short-term debt (H1 FY2026, no instrument detail in pool) + $178mm current finance/operating-lease obligations | Balance Sheet tab, Jun-30-2026 |
| Year 2 (~FY2027, FY2025-vintage bucket) | 48 | 0.3% | Finance-lease amortization only — no bond scheduled | Capital Structure Summary, Fixed Payment Schedule, FY2025 |
| Year 3 (~FY2028) | 2,850 | 19.3% | 2028 Convertible Notes $1,725mm (0.875%) + 2028 Exchangeable Senior Notes $1,125mm (0.000%, secured) | Capital Structure Details, FY2025 |
| Year 4 (~FY2029) | 1,500 | 10.2% | 2029 Senior Note (4.500%) | Capital Structure Details, FY2025 |
| Year 5 (~FY2030) | 1,250 | 8.5% | 2030 Senior Note (4.300%) | Capital Structure Details, FY2025 |
| Thereafter (FY2031+) | 6,830 | 46.4% | 2031 Senior Notes $1,000mm (4.150%) + 2034 Senior Note $1,500mm (4.800%) + 2035 Senior Notes $1,250mm (4.800%) + 2054 Senior Note $1,250mm (5.350%) + $1,830mm long-term lease liabilities | Capital Structure Details, FY2025; Balance Sheet tab, Jun-30-2026 (leases) |
| **Total** | **14,653** | **99.5%** | | |

**Reconciling item:** $14,653mm vs. $14,731mm canonical gross debt = a **$78mm (0.5%) gap**, consistent with the ~$79mm net original-issue-discount/issuance-cost adjustment that `01` shows nets bond principal ($12,381mm) down to carrying value ($12,302mm at FY2025) — bonds are shown above at principal, not carrying value. Not a missing-instrument gap.

**Bucket-definition caveat:** "Within 12 months" is a true rolling 12-month figure sourced from the Jun-30-2026 balance sheet. "Year 2" through "Thereafter" are FY2025 fiscal-year buckets (anchored to Dec-31-2025) that have **not** been re-cut for the ~14 months elapsed since — a mild double-counting/gap risk exists at the boundary between "Within 12 months" and "Year 2," but the known bond ladder (Years 3–thereafter) is unaffected since none of those bonds have moved.

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) — bonds & notes only, precise | **7.36 years** (computed from stated maturity dates vs. today 2026-08-06, weighted by principal; formula: Σ(principal × years-to-maturity) / Σ(principal), $10,600mm base) |
| Weighted-average maturity (years) — blended incl. leases + unidentified ST debt, approximate | **~5.9 years** (adds $1,997mm unidentified debt at an assumed 0.5-yr midpoint and $2,008mm of lease obligations at an assumed ~4-yr average — both **labelled estimates, inference not from filings**, since neither has a disclosed single maturity) |
| % due within 12 months | **14.8%** ($2,175mm / $14,731mm) |
| % due within 24 months | **15.1%** ($2,223mm / $14,731mm) |
| % due within 36 months | **34.4%** ($5,073mm / $14,731mm) |
| Largest single maturity year (and amount) | **FY2028 — $2,850mm (19.3% of total debt)**, driven by two notes maturing the same calendar year: 2028 Convertible Notes ($1,725mm, May–Dec 2028 window) + 2028 Exchangeable Senior Notes ($1,125mm) |

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share (of drawn/outstanding debt) | **100%** — Variable Rate Debt = $0 drawn at every period shown (FY2024–Mar-2026) | CIQ export, Capital Structure Summary tab, "Fixed Rate Debt" $9,475mm + "Zero Coupon Debt" $1,125mm = $10,600mm total bonds, FY2025; "Variable Rate Debt" row = 0 |
| Floating-rate share (of drawn/outstanding debt) | **0%** drawn. Up to $4,668mm undrawn revolver (Mar-31-2026) + $2,000mm undrawn commercial paper is benchmark-rate (floating) if drawn — currently 0% utilized | CIQ export, Capital Structure Summary tab, "Undrawn Revolving Credit" / "Undrawn Commercial Paper," Mar-31-2026 |
| Weighted-average coupon — bonds & notes ($10,600mm), all instruments | **3.55%** | Calc: Σ(principal × coupon)/Σ(principal); see Section 1 instrument list |
| Weighted-average coupon — plain-vanilla senior notes only ($7,750mm, excl. the two zero/near-zero-coupon convertible/exchangeable notes) | **4.67%** | Same calc, excluding 2028 Convertible Notes (0.875%) and 2028 Exchangeable Senior Notes (0.000%), which are priced for embedded equity optionality, not a comparable straight-debt yield |
| Weighted-average imputed rate, finance + operating leases (memo, not "refinanced" via capital markets) | Finance leases 6.00%; operating leases 6.60% (imputed) | CIQ export, Capital Structure Details tab |
| Current market refi rate (broad BBB-rated US corporate benchmark) | **5.61%** (ICE BofA BBB US Corporate Index effective yield, as of 2026-07-24) | Web: ycharts.com/ICE BofA BBB US Corporate Effective Yield, dated 2026-07-24 (indicative, unverified, broad-index proxy — not tenor-matched or UBER-specific) |
| Reference: 10-year US Treasury yield | 4.61% (2026-08-06) | Web: 10Y UST yield, 2026-08-06 (indicative, unverified) |
| Implied credit spread (BBB index vs. 10Y UST) | ~100bps | Calc: 5.61% − 4.61% |
| Estimated refi cost step-up — headline (all bonds vs. BBB benchmark) | **+206bps** (3.55% → 5.61%) | Calc: 5.61% − 3.55% |
| Estimated refi cost step-up — like-for-like (plain-vanilla notes only vs. BBB benchmark) | **+94bps** (4.67% → 5.61%) | Calc: 5.61% − 4.67% |

**Reading the two step-up figures:** the headline +206bps overstates the true refinancing cost because it compares straight-bond-equivalent market rates against a blended coupon that includes two zero/near-zero-coupon convertible/exchangeable notes ($2,850mm) priced cheap in exchange for embedded equity value — not a like-for-like refinancing cost. The **+94bps** plain-vanilla comparison is the more decision-useful estimate for what UBER would pay to refinance its straight senior notes today. Either way, the step-up is a genuine cost increase, not a rounding error: refinancing the $2,850mm of FY2028 maturities alone at even the conservative +94bps would add roughly $27mm/year of incremental interest expense (2,850 × 0.94%) versus today's blended coupon on that tranche, before accounting for the fact ~$2,850mm of that tranche currently carries a near-zero coupon specifically because of its convertible/exchangeable structure — a straight refinancing (without renewing the equity-linked feature) would cost meaningfully more than 94bps versus the old near-zero coupon on that specific tranche.

**S&P issuer rating:** BBB+ (foreign-currency long-term), as of the latest CIQ Credit Health Panel snapshot (2026-08-06) [CIQ export, Company Comparable Analysis, Credit Health Panel tab] — investment-grade, one notch above the broad "BBB" index used above, so the BBB-index benchmark is a conservative (not favorable) proxy for UBER's own likely refinancing cost.

**Cross-default / change-of-control / rating-trigger scan:** Not disclosed in the data pool — no indenture excerpts or guarantor/covenant notes are present.

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities ($2,223mm: $2,175mm within 12mo + $48mm Year-2) | Amount | Evidence |
|---|---:|---|
| Cash on hand | $4,870mm | CIQ export, Balance Sheet tab, Jun-30-2026 |
| Forecast FCF (CFO − total capex, CLAUDE.md §15 basis) | $10,116mm LTM (= $10,424mm CFO − $308mm capex) | CIQ export, Cash Flow tab, LTM Jun-30-2026. Cross-checked to management commentary: "a little bit over $10 billion in free cash flows over the trailing 12 months" [Q2 FY2026 transcript, p.11-12, CFO Balaji Krishnamurthy]. Note: CIQ's own "Levered Free Cash Flow" line item ($7,239mm LTM) uses a different, CIQ-internal definition (likely nets additional financing items) — the CFO-minus-capex figure above is the module-canonical basis and is the one that ties to management's own stated number. |
| Revolver availability (committed, undrawn) | $4,668mm (Mar-31-2026, most recent figure in pool; not updated to Jun-30-2026) | CIQ export, Capital Structure Summary tab, "Undrawn Revolving Credit." Commitment status ("committed" vs. "uncommitted") is not explicitly labelled in the pool — treated as a standard committed revolving facility per convention, since $0 is drawn against it across every period shown and CIQ tags it "Revolving Credit" (not a demand/uncommitted line). **Flagged: not independently confirmed as committed.** |
| Asset-sale proceeds | Unknown — none announced or authorized for debt reduction | Not disclosed in the data pool |
| New debt issuance | Unknown — no specific committed issuance for this wall is announced. Demonstrated market access: $6,229mm gross debt issued LTM Jun-30-2026 | CIQ export, Cash Flow tab, LTM |

**In plain terms:** the near-term wall (next 12–24 months, $2,223mm) is small relative to cash alone ($4,870mm, 2.2x coverage) and trivial relative to free cash flow (~$10.1bn LTM, ~4.5x coverage) — Uber does not need market access to clear the disclosed 24-month wall. It carries an investment-grade S&P rating (BBB+) and has issued $6,229mm of new debt in the trailing 12 months, evidencing continued capital-markets access. Floating-rate exposure on drawn debt is 0%, so a rate move does not directly reprice existing interest cost — it only affects the coupon on anything newly issued or drawn. The largest genuine near-term risk is not the disclosed wall itself but the **$1,997mm of unidentified new short-term debt** (Section 1) whose terms, lender, and true maturity date are not confirmed in this pool, and the pending **~€14 billion Delivery Hero acquisition bridge facility** (signed 2026-07-16, committed but undrawn, not reflected in any balance sheet above per `01`) — a near-certain, much larger future draw that this section's coverage math does not include. **Conclusion: self-funded / low refi risk for the disclosed 24-month wall**, conditional on the $1,997mm unidentified item behaving as ordinary short-term debt rather than a stressed facility, and explicitly excluding the DH bridge overlay, which is a separate, much larger, forward risk that `06_downside-stress-test` should model on its own terms.

## 5. Refinancing Read

The disclosed maturity wall is thin and cheap through 2027 (14.8% of debt within 12 months, next-to-nothing in the following year) before a real cluster hits FY2028 ($2,850mm, 19.3% of the stack, from two 2028 notes) — that cluster and everything after it is comfortably laddered out to 2054 (weighted-average maturity ~7.4 years on the bond stack), and none of it is floating-rate. Refinancing any of the plain-vanilla senior notes today would cost roughly +94bps over their current weighted coupon (4.67% → a ~5.6% BBB-index benchmark) — a real but not crippling step-up given Uber's BBB+ rating, $10.1bn of trailing free cash flow, and $4.9bn of cash. The single biggest refinancing risk is not the disclosed ladder at all: it is (1) the $1,997mm of new short-term debt that appeared on the balance sheet in H1 FY2026 with no instrument-level disclosure anywhere in this pool — its true tenor and terms are unconfirmed — and (2) the ~€14 billion Delivery Hero acquisition bridge facility, signed but undrawn, which is roughly the size of Uber's entire current debt stack and is not reflected in any figure in this report. **Uber survives the next 12 months under a "market closure" assumption (no new unsecured issuance) on currently disclosed instruments alone:** cash ($4,870mm) plus the committed, undrawn revolver ($4,668mm, availability known) total ~$9,538mm against a $2,175mm within-12-month wall — more than 4x coverage before any FCF is counted, and FCF alone (~$10.1bn LTM) would cover it again on its own. That conclusion does not extend to the DH bridge facility once drawn, which this module treats as a separate, labelled pro-forma overlay per `01` and is out of scope for this agent's 24-month wall read.

**Assumption label:** the $1,997mm unidentified short-term debt is treated here as behaving like ordinary repayable/refinanceable short-term debt (Inference, not from filings) because no contrary evidence (default notice, going-concern language, covenant breach) appears anywhere in the pool.
