# Maturity Wall & Refinancing — HAIER

**Company:** Haier Smart Home Co., Ltd. (SHSE:600690 / SEHK:6690). Reporting currency: **RMB (CNY), millions**, per the FY2025 Annual Report (CAS) and CapIQ exports — consistent with `01_capital-structure-and-leverage.md`. All figures below are gross-debt-stack figures anchored to `01`'s canonical total gross debt of **CNY 42,669.5mn (FY2025, Dec-31-2025)**; latest quarter (Mar-31-2026) gross debt is CNY 42,076.8mn but this agent uses the FY2025 audited balance-sheet cut for the year-by-year schedule build because that is where the underlying debt-note detail (current/non-current split, bond maturity dates, long-term-loan rate range) is disclosed.

**Methodology note on "within 12 months":** the pool does not carry an exact month-by-month maturity ladder. The FY2025 Annual Report classifies debt as current/non-current as of the balance-sheet date (Dec-31-2025); "current" = due within 12 months of that date, i.e., by Dec-31-2026. As of today (2026-08-13), roughly 4.5 months of that 12-month window have already elapsed — the schedule below is therefore presented on the disclosed fiscal-year-end bucket basis, not a rolling 12-month-from-today basis, and this is flagged wherever it affects a conclusion.

---

## 1. Maturity Schedule

| Period | Amount Due (CNYmn) | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (current, to Dec-31-2026) | 23,452.2 | 55.0% | Short-term unsecured/pledged/guaranteed credit loans (17,420.8) + current portion of long-term loans (4,356.5) + current finance-lease liabilities (1,631.3) + current portion of bond interest (43.7) | FY2025 Annual Report, Notes 七、25 (短期借款), 七、33 (1年内到期的非流动负债), 七、37 (租赁负债); CapIQ "Financials.xls" — Capital Structure Details, FY2025 |
| Year 2 (2027) | Not itemized (CNY 0 disclosed as maturing specifically in this window) | 0.0% (disclosed) | No instrument in the pool carries a stated 2027 maturity date | FY2025 Annual Report, Notes 七、35 (长期借款), 七、37 (租赁负债) — no year-2 maturity itemized; CapIQ Capital Structure Summary "Fixed Payment Schedule" (shows CNY 0 incremental lease payment due in "Next 5 Yrs" beyond Year 1) |
| Year 3 (2028) | 3,500.0 | 8.2% | Medium-Term Notes 001 (CNY 1,500.0mn, senior unsecured, 1.99% fixed, due 2028-02-25/26) + Medium-Term Notes 002 (CNY 2,000.0mn, senior unsecured, 1.66% fixed, due 2028-06-17/18) | FY2025 Annual Report, p.110 (银行间债券市场非金融企业债务融资工具 table); CapIQ "Fixed Income Securities Summary.rtf" |
| Year 4 (2029) | Not itemized | 0.0% (disclosed) | None disclosed | Same as Year 2 |
| Year 5 (2030) | Not itemized | 0.0% (disclosed) | None disclosed | Same as Year 2 |
| Thereafter / no stated maturity date | 15,717.3 | 36.8% | Long-term bank "Credit Loans" (CNY 10,915.1mn, unsecured) + "Pledge Loans" (CNY 250.8mn, secured) — function as rolling/evergreen bank facilities with no final maturity date disclosed; non-current finance-lease liabilities (CNY 4,551.4mn) — CapIQ's own "Fixed Payment Schedule" field buckets the entire non-current lease balance under "after 5 years," which likely reflects a CapIQ methodology limit (no underlying lease-by-lease schedule available) rather than confirmed >5-year contractual terms | FY2025 Annual Report, Note 七、35 (discloses a rate range but no maturity date); CapIQ "Financials.xls" — Capital Structure Summary, "Fixed Payment Schedule" section |
| **Total** | **42,669.5** | **100%** | | Ties exactly to `01`'s canonical gross-debt figure — no reconciling item |

**Reduced granularity flag:** per `00_solvency-data-triage.md`, this is a coarse (fiscal-year-end-bucketed) schedule, not a precise date-by-date ladder — 55.0% of the stack is bucketed to a single fiscal-year-end date rather than itemized by month, and 36.8% carries no maturity date in this pool at all. Treat the "within-12-months" figure as a wall, not a smooth roll-off.

---

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) — **dated tranche only (63.2% of debt)** | ≈0.74 years (~9 months), computed from Dec-31-2025: current bucket (87.0% of the dated tranche) at a 0.5-year midpoint + MTN 001 (5.6% of the dated tranche) at 2.15 years + MTN 002 (7.4%) at 2.46 years |
| Weighted-average maturity (years) — **full CNY 42,669.5mn stack** | **Not computable.** CNY 15,717.3mn (36.8% of gross debt — long-term bank loans + non-current lease liabilities) carries no disclosed final maturity date, so a whole-stack WAM would require an unlabeled assumption. This is the single largest data gap in this report and caps confidence below (Partial-Data Rule). |
| % due within 12 months | 55.0% (23,452.2 / 42,669.5) |
| % due within 24 months | 55.0% — no additional dated instrument matures before Dec-2027. **Caveat:** the undated 36.8% bucket could contain amounts that in practice roll or fall due inside this window; this figure is a floor, not a ceiling, on true 24-month exposure. |
| % due within 36 months | 63.2% (26,952.2 / 42,669.5) — adds the two 2028 MTNs |
| Largest single maturity year (and amount) | The within-12-months / FY2026 current bucket: **CNY 23,452.2mn (55.0% of gross debt)** — by a wide margin the largest identified concentration; no other single year exceeds CNY 3,500.0mn (8.2%, the 2028 bonds) |

---

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | CNY 3,500.0mn (8.2%) — the two Medium-Term Notes, 1.99% and 1.66% fixed | CapIQ "Financials.xls" — Capital Structure Summary tab, "Fixed Rate Debt" line, FY2025; FY2025 Annual Report, p.110 |
| Floating / undisclosed-mix share | CNY 39,169.5mn (91.8%) | By exclusion from the confirmed fixed-rate line above. The FY2025 Annual Report's interest-rate-risk note states the group holds "a mix of fixed-rate and floating-rate contracts" and decides the relative proportion of each "based on prevailing market conditions" — but does **not** disclose the split by instrument, so this bucket cannot be broken further into confirmed-floating vs confirmed-fixed-but-undisclosed-rate. [FY2025 Annual Report, Note 十七 (与金融工具相关的风险 — Risks Related to Financial Instruments), §4 利率风险 (Interest Rate Risk), p.238] |
| Disclosed rate points | Long-term bank loans: rate range **1.50%–5.30%** (no weighted average given) [FY2025 Annual Report, Note 七、35]. MTN 001: 1.99% fixed. MTN 002: 1.66% fixed (weighted ~1.80% across the CNY 3,500.0mn bond tranche). Short-term borrowings and finance-lease rates: **not disclosed anywhere in the pool.** | FY2025 Annual Report, Notes 七、35, 七、36; CapIQ Fixed Income Securities Summary |
| Weighted-average coupon (whole stack) | **Not precisely computable** — 91.8% of debt has no disclosed per-instrument rate. Best available proxy (this agent's own computation, labeled): FY2025 gross interest expense (CNY 2,679.5mn) ÷ average gross debt over FY2024–FY2025 (CNY 41,158.8mn) = **~6.5% implied effective cost**. This is almost certainly an overstatement of the pure loan/bond coupon rate — it likely also carries finance-lease interest (on the CNY 6,182.7mn lease liability included in gross debt) and possible discount/premium amortization, none of which is separable in this pool. | CapIQ "Financials.xls" — Income Statement tab (Interest Expense, FY2024/FY2025), Balance Sheet tab (Total Debt); this agent's computation |
| Current market refi rate — bank-loan benchmark (matching short/floating tenor) | PBOC 1-year Loan Prime Rate (LPR): **3.00%**, a record low for the series (established Aug-2019), as of Aug-2026 | Web: Trading Economics / PBOC LPR release, Aug-2026 (indicative, unverified) |
| Current market refi rate — bond benchmark (matching the 2028 notes' remaining tenor) | China Bond Yield, Medium & Short-Term Note (AAA), 3-year: **~1.64%** (1.635% on 2026-06-26, a series record low) | Web: CEIC / ChinaBond, data as of 2026-06-26 (indicative, unverified) |
| Estimated refi cost step-up (bps) | **2028 bond tranche (8.2% of debt):** weighted coupon ~1.80% vs current 3yr AAA MTN benchmark ~1.64% → an indicative **step-DOWN of roughly −15bps**, not a step-up — China's onshore bond yields have kept falling since these notes priced in 2025. **Bank-loan / short-term tranche (91.8% of debt):** cannot be computed precisely (no weighted-average coupon disclosed); the disclosed long-term-loan range (1.50%–5.30%) straddles the current 1-year LPR of 3.00%, so direction is genuinely mixed — some loans priced below LPR would reprice up, some priced well above it (up to 5.30%, likely FX or higher-risk-tranche loans) would reprice down. **Net read: nothing in the available data points to a refinancing cost step-up from here; if anything, the direction is flat-to-favorable given record-low Chinese benchmark rates.** |  |

---

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities (CNY 23,452.2mn) | Amount | Evidence |
|---|---:|---|
| Cash on hand | CNY 47,621.7mn (FY2025, Dec-31-2025); CNY 50,580.3mn (Q1 2026, Mar-31-2026) | CapIQ "Financials.xls" — Balance Sheet tab, per `01` §3. Covers the within-12-month bucket **2.0x** over and the within-36-month total (CNY 26,952.2mn) **1.8x** over, using cash alone |
| Forecast FCF | FY2025 FCF (CFO − total capex) = CNY 17,151.3mn (recent run-rate, labeled — not a company-issued forecast) | `earnings/01_historical-financials.md` |
| Revolver availability | **Unknown.** No revolving-credit-facility instrument is identified anywhere in the CapIQ Capital Structure Details; the FY2025 Annual Report only states narratively that the company "has obtained bank credit facilities from multiple commercial banks to meet working-capital needs and capex" with no quantified committed or undrawn total | FY2025 Annual Report, Note 十七, §2 流动风险 (Liquidity Risk), p.238; `01` §1, `00` §3 |
| Asset-sale proceeds | **Unknown / none announced.** No asset-sale program is disclosed as a funding source for debt repayment in this pool | Not disclosed in the data pool |
| New debt issuance | **No committed new issuance for near-term refinancing specifically.** The company has demonstrated recent market access: two Medium-Term Notes totaling CNY 3,500.0mn were issued in 2025 at fixed rates of 1.66%–1.99% | FY2025 Annual Report, p.110; CapIQ Fixed Income Securities Summary |

Cash on hand alone — with no need for FCF, a revolver, an asset sale, or new issuance — already covers the entire within-12-month bucket 2.0x over and the within-36-month total 1.8x over. The near-term wall (next 12–24 months) is covered by cash alone, not merely by cash-plus-FCF, so it does not depend on market access. No credit rating exists anywhere in this pool (S&P: "data not available"; Moody's: "account does not have access"; the company's own annual-report rating-adjustment disclosure is marked not-applicable) — a genuine gap in assessing formal market access, though the two 2025 bond placements are direct evidence the company can currently place debt. One data point worth flagging without over-reading it: CapIQ's own proprietary Credit Health Panel (as of 2026-08-12) ranks Haier in the bottom quartile (4th of 4) for "Overall," "Solvency," and "Liquidity" among 11 China household-appliance peers — including a bottom-quartile Solvency score even though `01` shows Haier is net cash on every basis — while scoring 2nd quartile for "Operational." This is a CapIQ relative-scoring methodology, not a rating-agency opinion, its formula is not disclosed in this pool, and it cannot be reconciled against the net-cash finding from the data available; it is recorded here as an unresolved flag, not evidence of distress. Floating/undisclosed-rate debt is 91.8% of the stack (§3) — that share of interest cost reprices with China's benchmark rates; today that is a tailwind (record-low LPR and bond yields), but it is a real, uncollateralized exposure if Chinese rates were to rise materially from current record lows, and no interest-rate swap is disclosed anywhere in the pool (only FX forward contracts are disclosed as hedges).

**Conclusion: self-funded / low refi risk.** The next-24-month wall is fully covered by cash on hand alone, without touching FCF, a revolver, or new issuance.

---

## 5. Refinancing Read

Haier's maturity wall is front-loaded and large in headline terms — 55.0% of gross debt (CNY 23,452.2mn) sits in a single fiscal-year-end bucket, by far the largest concentration in the stack, versus just 8.2% (the two 2028 bonds) with a confirmed later date and 36.8% with no disclosed maturity date at all. On cost, nothing in the available evidence points to a refinancing cost step-up: the only precisely dated fixed-rate tranche (the 2028 bonds, weighted coupon ~1.80%) would reprice roughly 15bps *lower* against the current ~1.64% China 3-year AAA benchmark, and the record-low 1-year LPR of 3.00% gives no reason to expect the undisclosed bank-loan/short-term tranche (91.8% of debt) to reprice materially higher either. The single biggest refinancing risk here is not price, it is disclosure: CNY 15,717.3mn (36.8%) of the stack carries no maturity date in this pool, there is no quantified committed/undrawn bank-facility figure anywhere, and there is no credit rating to independently corroborate market access — so the true shape of the wall beyond the FY2026 bucket, and the company's contractual fallback if a bank simply declined to roll a credit-line balance, cannot be verified from the data available. On survival: **Haier clears a 12-month "market closure" test (no new unsecured issuance) on cash alone** — FY2025 cash on hand of CNY 47,621.7mn covers the entire within-12-month bucket (CNY 23,452.2mn) 2.0x over, with the CNY 17,151.3mn of FY2025 FCF and any bank-facility roll available as further, untapped cushion; this is a direct comparison of `01`'s cash figure to this agent's own schedule, not an assumption.

