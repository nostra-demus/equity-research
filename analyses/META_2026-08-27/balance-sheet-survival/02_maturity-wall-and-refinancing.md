# Maturity Wall & Refinancing — META

Reporting currency: **USD, in millions** unless stated otherwise. Reporting standard: US GAAP. Fiscal year end: December 31. Balance-sheet date used: June 30, 2026 (Q2 FY2026 10-Q, filed Jul-30-2026). Gross debt figure reused from `01_capital-structure-and-leverage.md`: **$83,664m carrying value / $84,000m face value** — the filing's own funded-debt figure (senior unsecured Notes only; operating leases of $28,654m and finance leases of $1,184m are on-balance-sheet but not classified as "debt" by the company and are excluded here, consistent with `01`'s canonical scope).

## 1. Maturity Schedule

Meta discloses future principal payments **by calendar year**, not by rolling 12-month window from the balance-sheet date — this is the finest granularity in the filing. The table below uses the filing's own buckets, mapped to the nearest year-number label.

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (Remainder of 2026, i.e. Jul–Dec 2026) | $0 | 0.0% | None maturing | Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19 |
| Year 2 (2027) | $2,750 | 3.3% | Senior unsecured Notes — the 2027 tranche of the August-2022 series | Q2 FY26 10-Q, Note 8; tranche coupon (3.500%) and maturity date (Aug-15-2027) from Capital IQ Capital Structure Details, FY2025 (Dec-31-2025) basis — cross-checked and reconciles exactly to the 10-Q's series-level total |
| Year 3 (2028) | $1,500 | 1.8% | Senior unsecured Notes — the 2028 tranche of the May-2023 series | Q2 FY26 10-Q, Note 8; tranche detail (4.600% coupon, maturity May-15-2028) per Capital IQ Capital Structure Details, FY2025 basis |
| Year 4 (2029) | $1,000 | 1.2% | Senior unsecured Notes — a tranche within the August-2024 series (2029–2064 range); exact sub-tranche not separately itemized in the data pool | Q2 FY26 10-Q, Note 8 |
| Year 5 (2030) | $5,000 | 6.0% | Senior unsecured Notes — combines a $1,000m tranche of the May-2023 series (4.800% coupon, maturity May-15-2030, per Capital IQ) plus an estimated ~$4,000m from within the November-2025 series' 2030–2065 range, not separately itemized | Q2 FY26 10-Q, Note 8; partial tranche detail per Capital IQ Capital Structure Details, FY2025 basis |
| Thereafter (2031–2066) | $73,750 | 87.8% | Senior unsecured Notes — the balance of the August-2022, May-2023, August-2024, November-2025, and May-2026 series, laddered out to final maturities in 2062–2066 | Q2 FY26 10-Q, Note 8 |
| **Total (face value)** | **$84,000** | **100%** | | Q2 FY26 10-Q, Note 8 |
| Less: unamortized discount and issuance costs | ($336) | — | | Q2 FY26 10-Q, Note 8 |
| **Total (carrying value, reconciles to `01`'s canonical gross debt)** | **$83,664** | — | | Q2 FY26 10-Q, Consolidated Balance Sheets |

**Reconciliation check (self-check item):** the schedule sums to $84,000m face value, which ties to `01`'s stated $84,000m face / $83,664m carrying gross debt, with the $336m gap being unamortized discount and issuance costs (a standard non-cash reconciling item, not a missing obligation).

**Data-granularity limitation, flagged per MODULE_RULES Calculation Standard #9:** 87.8% of face debt ($73,750m) sits inside the undifferentiated "Thereafter" bucket, which spans 2031–2066 (35 years). Capital IQ's tranche-level detail (available only for the August-2022 and May-2023 series, $18,500m combined, itemized into 9 individual tranches with exact maturity dates: 2027-08-15 $2,750m/3.500%; 2028-05-15 $1,500m/4.600%; 2030-05-15 $1,000m/4.800%; 2032-08-15 $3,000m/3.850%; 2033-05-15 $1,750m/4.950%; 2052-08-15 $2,750m/4.450%; 2053-05-15 $2,500m/5.600%; 2062-08-15 $1,500m/4.650%; 2063-05-15 $1,750m/5.750%) itemizes $13,250m of the Thereafter bucket, with no single itemized year exceeding $3,000m. The remaining $60,500m (72% of total face debt — the balance of the August-2024 $10,500m, November-2025 $30,000m, and May-2026 $25,000m series) has **no disclosed year-by-year split** in either the 10-Q or the Capital IQ export. A single-year concentration inside "Thereafter" beyond what is itemized above cannot be ruled out from available data. [Capital IQ Capital Structure Details, FY2025 (Dec-31-2025) basis — company issued the May-2026 series after this CIQ snapshot, so that $25,000m series is not itemized at all.]

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years, from Jun-30-2026) | **~20.0 years** — Inference, not from filings. Computed using the 9 individually-dated tranches above (Aug-2022 + May-2023 series, $18,500m) plus the midpoint of the disclosed maturity range for the three un-itemized series (Aug-2024 $10,500m midpoint ≈2046.5; Nov-2025 $30,000m midpoint ≈2047.5; May-2026 $25,000m midpoint ≈2048.5), weighted by face value ($1,678,500m-years ÷ $84,000m = 19.98 years). The true figure could differ materially if the un-itemized 72% of debt is skewed toward either end of its disclosed range rather than centered. |
| % due within 12 months (through Jun-30-2027) | **0.0%** ($0). Confirmed directly by the 10-Q's "Remainder of 2026" line ($0) and corroborated by the tranche-level maturity date of the nearest bond (2027 tranche, Aug-15-2027 — 13.5 months out, per Capital IQ). |
| % due within 24 months (through Jun-30-2028) | **5.06%** ($4,250m = $2,750m 2027 tranche, Aug-15-2027, + $1,500m 2028 tranche, May-15-2028 — both confirmed inside the 24-month window by tranche-level dates). |
| % due within 36 months (through Jun-30-2029) | **5.06%–6.25%** ($4,250m–$5,250m). The 2029 bucket ($1,000m) is not dated to the month in the data pool, so whether it falls before or after Jun-30-2029 is unknown; range shown reflects that uncertainty. Conservative reading (all of it inside the window): 6.25%. |
| Largest single **disclosed** maturity year (and amount) | **2030 — $5,000m (6.0% of face debt).** This is the largest of the specifically-broken-out years (2027–2030); it is dwarfed by the un-itemized "Thereafter" bucket ($73,750m, 87.8%), inside which a larger single-year spike cannot be ruled out from available data (see §1 limitation above). |

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | **100%** | All outstanding Notes are fixed-rate; Meta has no revolving credit facility, commercial paper program, term loan, or other floating-rate funded debt disclosed [`01_capital-structure-and-leverage.md` §1]. Finance leases ($1,184m, FY2025 basis) also carry a fixed imputed discount rate (4.1%). |
| Floating-rate share | **0%** | Same as above — no floating-rate instruments exist in the debt stack. |
| Weighted-average coupon (stated rate) | **≈5.04%** — Inference, not from filings. Computed by weighting each series' disclosed stated-rate range midpoint (or, for the 9 itemized tranches, the exact stated coupon) by face value: (2,750×3.500 + 1,500×4.600 + 1,000×4.800 + 3,000×3.850 + 1,750×4.950 + 2,750×4.450 + 2,500×5.600 + 1,500×4.650 + 1,750×5.750 + 10,500×4.925[mid] + 30,000×4.975[mid] + 25,000×5.500[mid]) ÷ 84,000 = 5.039%. | Q2 FY26 10-Q, Note 8 (series-level stated-rate ranges); Capital IQ Capital Structure Details, FY2025 basis (tranche-level coupons for the two itemized series) |
| Weighted-average coupon (effective rate) | **≈5.09%** — Inference, not from filings, same method applied to the 10-Q's disclosed effective-rate ranges (which run 3.63%–4.71%, 4.68%–5.79%, 4.42%–5.60%, 4.27%–5.77%, 4.60%–6.48% by series) using series-level range midpoints (exact tranche-level effective rates not separately disclosed). | Q2 FY26 10-Q, Note 8 |
| Current market refi rate (proxy, not tenor-matched) | **≈5.25%** (ICE BofA AA US Corporate Index effective yield, 2026-08-20) | Web: FRED series BAMLC0A2CAAEY, 2026-08-20 (indicative, unverified). This is a blended index across the AA curve, not matched to META's own ~20-year weighted-average tenor — flagged as a limitation; a purely long-dated (20–30yr) AA new-issue rate would likely run somewhat above this blended figure given the current upward-sloping yield curve (10-year UST ≈4.65%, Web: Trading Economics / FRED DGS10, 2026-08-26). |
| Estimated refi cost step-up (bps) | **≈+21bps** on the stated-coupon basis (5.25% market − 5.04% own coupon); **≈+16bps** on the effective-rate basis (5.25% − 5.09%). Both modest. Cross-checked against the filing's own market signal: the 10-Q discloses the Notes' total estimated fair value at $79.75bn versus $84.0bn face (a Level-2, market-quote-based estimate) as of Jun-30-2026 [Q2 FY26 10-Q, Note 8] — a ~5% discount to par consistent with market yields having risen somewhat above the (largely lower-coupon, earlier-vintage) tranches' stated rates, in the same direction as the step-up estimated above. |

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities ($4,250m through Jun-2028) | Amount | Evidence |
|---|---:|---|
| Cash on hand | $15,462m (Jun-30-2026) — 3.6x the entire next-24-month maturity total, and 1.5x the entire cumulative debt due through 2030 ($10,250m) | Q2 FY26 10-Q, Consolidated Balance Sheets |
| Forecast FCF (recent run-rate, labeled) | TTM company-disclosed FCF = $37,872m, down 20.4% YoY (FY2025 $43,585m; FY2024 $52,103m) — no forward FCF guidance disclosed in the pool, so this is a trailing run-rate, not a forecast | `01_capital-structure-and-leverage.md` §6, sourced from `earnings/01_historical-financials.md` §1–2 |
| Revolver availability | Not applicable — Meta has no revolving credit facility, commercial paper program, or committed line of credit disclosed anywhere in the 10-K or 10-Q | `01_capital-structure-and-leverage.md` §1 |
| Asset-sale proceeds | Unknown — no asset-sale programme announced or authorized against these maturities in the data pool | Not disclosed |
| New debt issuance | Unknown/not committed for future maturities specifically — but the company has demonstrated repeated, ready capital-markets access: five senior unsecured issuances since Aug-2022 totaling $84,000m face value, most recently $25,000m in May-2026 (used to fund the AI-infrastructure capex programme, not to refinance existing debt, since nothing has matured yet) | Q2 FY26 10-Q, Note 8; `01_capital-structure-and-leverage.md` §6 |

Meta's near-term wall is trivially covered by cash alone: $0 is due in the next 12 months, and the entire $4,250m due within 24 months is 3.6x smaller than cash on hand ($15,462m) even before counting the further $74,798m of marketable securities or any of the $37,872m TTM FCF. No financial covenants exist under the Notes ("We are not subject to any financial covenants under the Notes" [Q2 FY26 10-Q, Note 8]), so there is no covenant-triggered acceleration risk tied to leverage or coverage weakening ahead of a maturity. Meta's TTM EBITDA/interest coverage of 55.2x [`04_coverage-and-covenants.md` §1] and an S&P long-term foreign-currency rating of AA- [Capital IQ Credit Health Panel, "Financials Updated" 2026-07-31] both point to strong, proven market access — evidenced directly by five successful bond issuances since Aug-2022, the latest as recently as May-2026. There is 0% floating-rate exposure, so a rate shock (e.g. +200bps) would not reprice any of Meta's existing interest cost — only the coupon on future new issuance would be affected. Conclusion: **self-funded / low refi risk.**

## 5. Refinancing Read

The wall is not a near-term problem: $0 is contractually due in the next 12 months, only 3.3% of face debt ($2,750m) is due in the next ~13.5 months to 24 months (2027), and the weighted-average maturity runs roughly 20 years (Inference) with 87.8% of face debt sitting past 2030. The estimated refinancing cost step-up is modest — roughly +16 to +21bps versus Meta's own ~5.04–5.09% weighted-average coupon, using a web-sourced AA corporate benchmark (≈5.25%, 2026-08-20, indicative) that is not perfectly tenor-matched to Meta's long-dated maturity profile. The single biggest refinancing risk is not the schedule itself but its opacity: 87.8% of face debt ($73,750m) sits in an undifferentiated "Thereafter" bucket with no disclosed year-by-year split, so a genuine single-year concentration decades out cannot be ruled out from available data — though given Meta's currently minimal leverage (net debt/EBITDA 0.61x strict basis, per `01`) and demonstrated market access, even a large single-year spike would likely be manageable when it eventually becomes near-dated. **Meta survives the next 12 months under a "market closure" assumption (no new unsecured issuance) with no adjustment required at all**: there is no contractual maturity in that window, and cash on hand ($15,462m) alone — before any FCF, marketable securities, or new issuance — covers the entire debt stack due through 2030 ($10,250m) 1.5x over.

---

Out-of-scope request received: none. This report stays within maturity-wall and refinancing-exposure scope; liquidity runway, coverage/covenant headroom, and the downside stress test are owned by `03`, `04`, and `06` respectively.
