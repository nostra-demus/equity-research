# Maturity Wall & Refinancing — KAR

Karoon Energy Ltd (ASX: KAR) reports under IFRS (AASB) in **US dollars** (reporting currency for every figure below), fiscal year ended 31-Dec-2025 for the audited anchor date. This agent reuses the canonical debt stack from `01_capital-structure-and-leverage.md`: gross debt (carrying value) **$338.8m** = Senior Secured Notes $337.7m (net of unamortized issuance costs; $350.0m face value) + finance leases $1.1m. No `ciq_facts.json` sidecar exists for this run; the maturity and rate-exposure figures below are read directly from the FY2025 Annual Report's Liquidity Risk and Financial Risk Management notes, cross-checked against the Capital IQ Fixed Income Securities Summary export and the most recent quarterly Activities Reports.

## 1. Maturity Schedule

Anchor date: **31-Dec-2025** (FY2025 audited balance sheet, consistent with `01`'s canonical figures). Amounts are carrying value, US$ millions. Karoon's debt is effectively **two instruments**: a single bullet Note maturing 14-May-2029, and an immaterial finance-lease tail; there is no laddered amortization schedule to speak of.

| Period (from 31-Dec-2025) | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (to 31-Dec-2026) | $0.7m | 0.2% | Finance lease, current portion | FY2025 Annual Report, Consolidated Statement of Financial Position, p.79; Note 14 |
| Year 2 (1-Jan-2027 to 31-Dec-2027) | $0.4m | 0.1% | Finance lease, non-current (short remaining term) | FY2025 Annual Report, Note 14 Leases |
| Year 3 (1-Jan-2028 to 31-Dec-2028) | $0.0m | 0.0% | None — but see §4: the $340.0m RBL facility (undrawn, already amortising — see §4) matures 30-Sep-2028, within this window | FY2025 Annual Report, Note 17 Borrowings |
| Year 4 (1-Jan-2029 to 31-Dec-2029) | $337.7m | 99.7% | Second Priority Senior Secured Notes, $350.0m face / $337.7m carrying, single bullet, matures 14-May-2029 | FY2025 Annual Report, Note 17 Borrowings, p.106–107; Capital IQ Fixed Income Securities Summary (maturity date 2029-05-14) |
| Year 5 (1-Jan-2030 to 31-Dec-2030) | $0.0m | 0.0% | None | — |
| Thereafter | $0.0m | 0.0% | None | — |
| **Total** | **$338.8m** | **100%** | Reconciles to `01`'s canonical gross debt (carrying value) exactly: $0.7m + $0.4m + $337.7m = $338.8m | Derived; cross-checked to `01_capital-structure-and-leverage.md` §7 |

The filing's own liquidity-risk note buckets maturities differently (<6mo / 6–12mo / 1–3yr / 3–5yr / >5yr) and discloses **undiscounted contractual cash flows including future interest**, not principal alone: borrowings show $18.4m (<6mo) + $18.4m (6–12mo) + $73.5m (1–3yr) + $368.4m (3–5yr) = $478.7m total, of which $368.4m in the 3–5yr bucket is the $350.0m principal bullet plus one semi-annual coupon (~$18.4m at 10.5% on $350m/2) landing in the same window [FY2025 Annual Report, Note 20(d) Liquidity Risk, p.117]. The table above reconstructs the **principal-only** schedule used by this module (per MODULE_RULES.md's "wall, not the average" convention), reconciled to `01`'s carrying-value gross debt.

**As-of-today reframing:** eight months have passed between the audited anchor date (31-Dec-2025) and today (27-Aug-2026). From today, the Notes' bullet maturity is **14-May-2029, ~32 months (2.7 years) away** — still outside the 36-month window from today by roughly four months. The small lease amounts ($1.1m total) will likely have substantially rolled off by now given their short disclosed remaining terms, but no interim (H1 FY2026) balance sheet is in the data pool to confirm the exact residual — this is this agent's own dating exercise, labeled *Inference, not from filings*.

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years), from 31-Dec-2025 anchor | **~3.4 years** — derived: ($0.7m×0.5yr + $0.4m×1.5yr + $337.7m×3.37yr) ÷ $338.8m ≈ 3.36 years |
| Weighted-average maturity (years), from today (27-Aug-2026) | **~2.7 years** (Inference, not from filings — rolls the same schedule forward by the ~0.66 years elapsed) |
| % due within 12 months | 0.2% ($0.7m ÷ $338.8m) |
| % due within 24 months | 0.3% ($1.1m ÷ $338.8m) |
| % due within 36 months | 0.3% (unchanged — no debt matures in Year 3; the Notes land in Year 4) |
| Largest single maturity year (and amount) | **2029 — $337.7m carrying value / $350.0m face value, 99.7% of gross debt** — a single bullet repayment, not an amortizing schedule |

This is a **barbell, not a ladder**: essentially nothing is due for four years, then nearly the entire debt stack comes due at once in a single bullet. A weighted-average maturity of ~3.4 years reads comfortably in isolation, but it conceals that the "wall" is really one $350.0m cliff in 2029, not a spread-out repayment profile — the WAM understates the concentration risk on its own (MODULE_RULES.md §3, "the wall, not the average").

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | ~100% of drawn debt ($350.0m face value Notes, fixed 10.50% coupon); the $1.1m of finance leases (0.3% of gross debt) carry no separately disclosed rate | FY2025 Annual Report, Note 17 Borrowings; Note 20(a)(ii) Interest Rate Risk table, p.114 — "Fixed Interest Rate" column shows $350.0m of Borrowings, $0 floating |
| Floating-rate share | 0% of drawn debt currently (the $340.0m RBL is undrawn at both 31-Dec-2025 and 30-Jun-2026, so it contributes no current floating exposure); if drawn, it would be floating (term SOFR + an undisclosed margin) — a **contingent** rate exposure, not a current one | FY2025 Annual Report, Note 17; Note 20(a)(ii), p.114 ("As at 31 December 2025 and 31 December 2024, there was no interest rate hedging in place") |
| Weighted-average coupon | 10.50% (the only rate-bearing debt currently outstanding is the fixed-coupon Notes) | FY2025 Annual Report, Note 17; Capital IQ Fixed Income Securities Summary |
| Current market refi rate (matching tenor) | **8.211% yield-to-worst** on KAR's own outstanding Notes, priced at 103.571 (i.e., trading *above* par) — this is a live, instrument-specific market read, not a generic benchmark | Capital IQ Fixed Income Securities Summary export, "Current YTW" / "Current Price" fields, pool extraction dated 2026-08-27 |
| Cross-check (generic benchmarks, web-sourced) | 5-year US Treasury yield ~4.33% (Web: FRED/Treasury, 2026-08-05, indicative, unverified); ICE BofA Single-B US High Yield Index effective yield ~7.31% (Web: FRED series BAMLH0A2HYBEY, most recent found dated ~Apr-2026, indicative, unverified, ~4 months stale) | Web-sourced, dated and labeled per MODULE_RULES.md |
| Estimated refi cost step-up (bps) | **−229bps (a decrease, not a step-up):** 8.211% market YTW − 10.50% coupon = −2.289 percentage points | Derived from the two rows above |

**Read this table carefully — it runs against the usual pattern.** Karoon's bond currently trades *above* par (103.571 vs 100 issued), meaning the market's required yield on this exact credit (8.211%) sits below the 10.50% coupon it was issued at in May-2024. The generic single-B high-yield cross-check (~7.31%, though several months stale) and the 5-year Treasury (~4.33%) both corroborate that 8.2% is a plausible market-clearing rate for a B/B+-rated, oil-and-gas-secured credit today, not a data anomaly. If Karoon refinanced the Notes today, the evidence points to a **lower** cost of debt than the existing coupon, not a higher one — consistent with net leverage falling from 2.13x (FY2022) to 0.36x (FY2025) over the period `01_capital-structure-and-leverage.md` documents. This is a snapshot as of the extraction date; market yields can move materially over the ~2.7 years remaining to the 2029 maturity, and this is not a forecast that they will stay this low.

The Notes carry a **next call date of 3-Sep-2026** (call price 105.25% of par) [Capital IQ Fixed Income Securities Summary] — roughly one week from this report's date. This gives Karoon an early opportunity to refinance the Notes at the improved market rate implied above, at the cost of a 5.25-point call premium; whether management intends to exercise it is not disclosed in this data pool.

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

Next-24-month scheduled maturities total **$1.1m** (finance leases only, per §1) — the following sources are shown for completeness, not because a shortfall exists.

| Source of repayment for next-24m maturities ($1.1m) | Amount | Evidence |
|---|---:|---|
| Cash on hand | $206.1m (31-Dec-2025, audited) / $80.3m (30-Jun-2026, unaudited quarterly update) | FY2025 Annual Report, p.79; 2Q26 Activities Report (Jul-22-2026), p.4 — "cash and cash equivalents" |
| Forecast FCF (or recent run-rate, labeled) | FY2025 FCF was **negative $37.1m** (CFO $251.4m − Capex $288.5m); TTM-to-30-Jun-2025 FCF was negative $9.9m | `earnings/01_historical-financials.md` §1–§2. Labeled: this is a trailing run-rate, not a forward forecast, and it is negative — flagged explicitly, though the $1.1m maturity window is far too small for FCF sign to matter |
| Revolver availability (only if availability known) | $283.3m committed, undrawn, available as of 30-Jun-2026 (amortising: was $340.0m at inception, stepped to $283.3m on 31-Mar-2026, and is scheduled to step further to $226.7m on 30-Sep-2026 under the semi-annual borrowing-base redetermination / straight-amortising schedule) | 2Q26 Activities Report (Jul-22-2026), p.4, "Liquidity" table and accompanying text |
| Asset-sale proceeds (only if announced / authorized) | Unknown — no asset sale is announced or authorized in the data pool | Not disclosed |
| New debt issuance (only if committed / announced) | Unknown — no new issuance is committed or announced in the data pool | Not disclosed |

The near-term wall (next 12–24 months) is **trivially covered by cash alone** — $1.1m of maturities against $80.3m–$206.1m of cash on hand, before any FCF, revolver, or market access is even needed. FCF has been negative on a trailing basis (FY2025: −$37.1m; TTM-to-Jun-2025: −$9.9m), driven by heavy growth capex (Baúna flotel revitalisation, SPS-92 well intervention, Who Dat A1 sidetrack — together $214.6m across 1Q26–2Q26 per `01`'s §6) rather than by operating weakness, but this does not threaten the maturity schedule itself because there is essentially nothing scheduled to refinance in the window; it is, however, the reason net debt rose from $132.7m (31-Dec-2025) to $269.7m (30-Jun-2026) and cash fell from $206.1m to $80.3m over the same six months — a liquidity-trajectory finding that belongs to `03_liquidity-runway` but is flagged here as context. Floating-rate share is currently 0% of drawn debt, so a rate move today reprices nothing; if the RBL is ever drawn, 100% of the drawn balance would reprice with SOFR. Rating posture: S&P **B (Stable)** issuer / **B+** issue-level, Fitch **B (Stable)** — both sub-investment-grade, unchanged since the 2024 issuance [`01_capital-structure-and-leverage.md` §0; Capital IQ Fixed Income Securities Summary], and the bond's own market pricing (above par, §3) is a favorable, not adverse, signal for market access today. Conclusion: **self-funded / low refi risk** for the next 12–24 months — the wall does not require market access at all in that window.

## 5. Refinancing Read

Karoon's maturity profile is a barbell, not a wall in the near term: 99.7% of its $338.8m gross debt (carrying value) is a single $350.0m (face) bullet Note maturing 14-May-2029, roughly 2.7 years from today, with only $1.1m of finance-lease payments due in the next 24 months [§1–§2]. Refinancing that bullet today would likely cost **less**, not more, than its 10.50% coupon — the Notes currently trade above par with a market yield-to-worst of 8.211% (Capital IQ, priced 2026-08-27), roughly 229bps below the coupon and broadly consistent with the wider single-B high-yield energy market [§3] — though that is a snapshot, not a guarantee held over the next 2.7 years. The biggest refinancing risk is not the near-term wall but the **compression of two events into 2028–2029**: the $340.0m committed RBL backstop is on a fixed, reserves-based amortisation schedule that has already cut availability to $283.3m (31-Mar-2026) and is scheduled to fall to $226.7m by 30-Sep-2026 regardless of Karoon's own credit trajectory, and that facility matures 30-Sep-2028 — roughly eight months before the $350.0m Notes bullet comes due in May-2029 — meaning Karoon will likely need to refinance or replace both instruments within a short window while carrying sub-investment-grade B/B+ ratings in a commodity-cyclical, currently unhedged business [`business-model/10_external-dependency.md`]. **Under a "market closure" assumption (no new unsecured issuance for 12 months), Karoon survives the next 12 months**: it has no unsecured-market refinancing need in that window ($0.7m of scheduled lease maturities only), $80.3m of cash on hand (30-Jun-2026), and a $283.3m committed, already-secured, undrawn RBL that does not require fresh capital-markets access to draw — *Inference, not from filings: this assumes the RBL's disclosed borrowing-base amortisation (283.3m → 226.7m by Sep-2026) does not fall to zero within the next 12 months, which the disclosed step-down schedule does not suggest.*
