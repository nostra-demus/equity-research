# Capital Structure & Leverage — HAIER

**Company:** Haier Smart Home Co., Ltd. (Shanghai Stock Exchange A-shares, SHSE:600690; Hong Kong Stock Exchange H-shares, SEHK:6690; Frankfurt D-shares; US Level-1 ADR). Household-appliance manufacturer — the Business Type Applicability Gate does not exclude this module (not a bank/insurer/REIT).

**Reporting currency: RMB (CNY), stated in millions unless noted.** Reporting standard: China Accounting Standards for Business Enterprises (CAS/ASBE) for the A-share filing; the H-share filing restates to IFRS but the company states net profit and equity attributable to owners "are not different" between the two bases [Q1 2026 Report (HKEX), Apr-27-2026, p.1]. All figures below are as reported — no FX conversion applied. The debt-note source is the FY2025 Annual Report's Notes to Accounts (七、25 short-term borrowings, 七、35 long-term borrowings, 七、36 bonds payable, 七、37 lease liabilities), read alongside the CapIQ "Capital Structure Details"/"Capital Structure Summary" tabs, which reconcile to the balance sheet within rounding (verified below). No `ciq_facts.json` sidecar exists for this ticker, so all CapIQ figures cited here are this agent's own sourced reads of the workbook exports, not a mechanically-pinned value.

**Cyclicality flag:** `business-model/07_business-quality.md` classifies Haier as "a conservatively financed, **cyclical** global manufacturer" (cyclicality factor scored 34/100, the weak end of the band — durable-good demand tied to China's property cycle and US rate/consumption cycles) and names FY2024 as the margin/return-on-capital "cyclical high-water mark." Per MODULE_RULES, leverage is therefore shown below on both the latest-year EBITDA and a normalised (5-year average) EBITDA basis.

---

## 1. Debt Stack

**Aggregated view (FY2025, ended Dec-31-2025):**

| Instrument | Amount (CNYmn) | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Short-term debt / current portion of long-term debt & leases | 23,452.2 | Consolidated group (listed parent, Haier Smart Home Co., Ltd.) — onshore CNY | Mixed: mostly unsecured (CNY 17,158.3mn short-term unsecured credit + CNY 4,356.5mn current portion of long-term loans + CNY 195.9mn short-term guaranteed loan unsecured); CNY 66.6mn secured (short-term mortgaged/guaranteed + short-term pledge loans) | Senior | Guarantees/mortgages/pledges on the small secured sub-lines only; not itemised further | 2026-12-31 (fiscal-year-end bucket — CapIQ maturity field is not an exact date for these lines, see note below) | Not disclosed (rate not broken out in CapIQ export; no coupon shown for bank loans) | CapIQ "Financials.xls" — Capital Structure Details & Balance Sheet tabs, FY2025 (filed 2026-03-27); FY2025 Annual Report, Notes 七、25/33/35/37 |
| Bonds / notes (Medium-term Notes 001 & 002) | 3,500.0 | Consolidated group (listed parent) — onshore CNY | No | Senior unsecured | None | 2028-02-25 (CNY 1,500.0mn, coupon 1.99%) and 2028-06-17 (CNY 2,000.0mn, coupon 1.66%) | Fixed | CapIQ "Financials.xls" — Capital Structure Details, FY2025; CapIQ "Fixed Income Securities Summary.rtf" (confirms the Jun-2028 note: senior unsecured, 1.66% coupon, offered Jun-17-2025); FY2025 Annual Report, Note 七、36 (应付债券) |
| Term loans (non-current: "Credit Loans" + "Pledge Loans") | 11,165.9 | Consolidated group (listed parent) — onshore CNY | Mostly unsecured (CNY 10,915.1mn Credit Loans unsecured; CNY 250.8mn Pledge Loans secured) | Senior | Pledge on the CNY 250.8mn sub-line only | No stated maturity in the CapIQ export — functions as a rolling/long-term bank facility, not confirmed as a committed revolver (see §6A) | Not disclosed | CapIQ "Financials.xls" — Capital Structure Details, FY2025; FY2025 Annual Report, Note 七、35 (长期借款) |
| Revolver (drawn) | Not disclosed | n/a | n/a | n/a | n/a | n/a | n/a | No revolving-credit-facility line item appears anywhere in the CapIQ Capital Structure Details, and the FY2025 Annual Report only states narratively that the company "has obtained bank credit facilities from multiple commercial banks to meet working-capital needs and capex," with no quantified committed/undrawn total [FY2025 Annual Report, 流动风险 note] — flagged per `00_solvency-data-triage.md` |
| Finance / capital leases | 6,182.7 (1,631.3 current + 4,551.4 non-current) | Consolidated group (listed parent) — onshore CNY | Yes (secured) | Senior | Leased assets | Current portion within 12 months; remainder per underlying lease terms (not itemised by year in this pool) | Not disclosed | CapIQ "Financials.xls" — Capital Structure Details & Balance Sheet, FY2025; FY2025 Annual Report, Note 七、37 (租赁负债); Note 七、19 shows the paired right-of-use asset at CNY 6,024.2mn |
| **Total gross debt** | **42,669.5** | — | Secured: CNY 6,500.0mn (15.2%); Unsecured: CNY 36,169.5mn (84.8%, incl. the CNY 3,500mn senior unsecured bonds) | All Senior | — | See maturity-wall detail below (owned by `02`) | Fixed: CNY 3,500.0mn (8.2%, the two MTNs); Floating/not disclosed: remainder | Ties to Balance Sheet tab "Total Debt" 42,669.4797 and Capital Structure Summary "Total Debt Outstanding" 42,669.4797 — reconciled exactly |

Note on the ST-maturity field: per `00_solvency-data-triage.md`, CapIQ buckets most short-term bank-loan lines to the fiscal year-end (2026-12-31) rather than an exact date — this is a coarse bucket, not a precise schedule, and the maturity wall (`02`) should treat it as such.

**Instrument-level detail, FY2025 vs FY2024 (CapIQ "as reported," principal due):**

| Description | Type | FY2025 (CNYmn) | FY2024 (CNYmn) | Coupon | Maturity | Secured |
|---|---|---:|---:|---|---|---|
| Short-term Unsecured Credit Loan | Term Loans | 17,158.3 | 13,270.9 | Not disclosed | 2026-12-31 | No |
| Current Portion of Long Term Loans | Term Loans | 4,356.5 | 10,365.2 | Not disclosed | 2026-12-31 | No |
| Lease Liabilities | Capital Lease | 6,182.7 | 5,833.4 | Not disclosed | — | Yes |
| Credit Loans | Term Loans | 10,915.1 | 9,556.9 | Not disclosed | — | No |
| Medium-term Notes 002 | Bonds and Notes | 2,000.0 | — (new in FY2025) | 1.660% | 2028-06-17 | No |
| Medium-term Notes 001 | Bonds and Notes | 1,500.0 | — (new in FY2025) | 1.990% | 2028-02-25 | No |
| Short-term Guaranteed Loan | Term Loans | 195.9 | 466.7 | Not disclosed | 2026-12-31 | No |
| Pledge Loans | Term Loans | 250.8 | 108.2 | Not disclosed | — | Yes |
| Short-term Pledge Loans | Term Loans | 38.2 | 46.8 | Not disclosed | 2026-12-31 | Yes |
| Short-term Mortgaged and Guaranteed Loan | Term Loans | 28.4 | — | Not disclosed | 2026-12-31 | Yes |
| **Total Principal Due** | | **42,625.9** | **39,648.1** | | | |
| Total Adjustments | | 43.7 | — | | | |
| **Total Debt Outstanding** | | **42,669.5** | **39,648.0** | | | |

Source: [CapIQ "Financials.xls" — Capital Structure Details tab, FY2025 filed 2026-03-27 and FY2024 filed 2026-03-27]. Cross-check: the FY2025 line items sum to CNY 42,625.9mn principal, which plus the CNY 43.7mn adjustment ties exactly to the CapIQ-stated "Total Debt Outstanding" of CNY 42,669.5mn and to the Balance Sheet tab's independently-derived "Total Debt" of CNY 42,669.4797mn — the two CapIQ tabs reconcile. The two Medium-term Notes are new in FY2025 (no FY2024 comparative); the Fixed Income Securities Summary confirms the CNY 2,000mn note was offered 2025-06-17, senior unsecured, at 1.66%.

---

## 2. Other Debt-Like Obligations

| Obligation | Amount (CNYmn) | Treatment | Source |
|---|---:|---|---|
| Operating leases | Already substantially capitalized on-balance-sheet as "Lease Liabilities" (CNY 6,182.7mn, in Section 1's total gross debt) — China's leases standard (effective 2021, CAS 21) capitalizes most leases similarly to IFRS 16, and the FY2025 right-of-use asset is CNY 6,024.2mn. Separately, CapIQ's analytical "Debt Equivalent Oper. Leases" supplemental line imputes an **additional** CNY 10,994.6mn of debt-equivalent value for operating-lease-type commitments not captured in the capitalized lease liability (e.g., short-term/low-value leases under a practical-expedient exemption) — this is a CapIQ analytical estimate, not a company-disclosed liability, and is **not** included in the Section 1 gross-debt total. FY2025 imputed operating-lease interest expense is CNY 715.8mn and imputed depreciation CNY 658.6mn (net rental expense CNY 1,374.3mn). | FY2025 Annual Report, Notes 七、19 (使用权资产) and 七、37 (租赁负债); CapIQ "Financials.xls" — Balance Sheet tab (Debt Equivalent Oper. Leases) and Income Statement tab (Imputed Oper. Lease Interest Exp./Depreciation), FY2025 |
| Pension / OPEB underfunding | Balance-sheet line "Pension & Other Post-Retire. Benefits": CNY 1,587.5mn (FY2025), down from CNY 1,766.5mn (FY2024). CapIQ's more granular Pension/OPEB tab shows a combined net unfunded defined-benefit obligation of ≈CNY 2,155.9mn (pension: CNY 1,293.5mn foreign-plan + CNY 862.4mn domestic-plan) plus CNY 34.0mn OPEB — a small reconciliation gap (~CNY 600mn) against the balance-sheet line likely reflects different netting/classification between the two CapIQ views; both are CapIQ reads, not the company's own itemised note (China's basic pension is a defined-contribution state scheme — FY2025 defined-contribution cost was CNY 2,478.8mn, expensed, not a balance-sheet liability). Immaterial relative to CNY 300.6bn total assets or CNY 42.7bn total debt. | CapIQ "Financials.xls" — Balance Sheet tab and Pension/OPEB tab, FY2025 |
| Preferred equity | None on the consolidated balance sheet — the company's own template line for "其他权益工具...优先股/永续债" (other equity instruments — preferred shares / perpetual bonds) is blank/nil in both FY2025 and FY2024 [FY2025 Annual Report, p.119–121]. Separately, CapIQ's Fixed Income Securities Summary lists one "Perpetual" preferred security issued by a UK subsidiary, Haier Smart Home UK & I Limited — but shows no outstanding-amount, currency, or offering data (all fields "-"), so materiality cannot be confirmed from this pool; treated as immaterial/undisclosed-amount pending confirmation (see §6A). | FY2025 Annual Report (A-share/CAS), p.119–121; CapIQ "Fixed Income Securities Summary.rtf" |

---

## 3. Cash & Liquid Assets

| Item | Amount (CNYmn, FY2025 / Q1 2026) | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | 47,621.7 / 50,580.3 | No restricted-cash line item found on the CapIQ balance sheet | CapIQ "Financials.xls" — Balance Sheet tab, Dec-31-2025 and Mar-31-2026 |
| Short-term investments | 9,988.6 / 11,011.2 | Not flagged as restricted | CapIQ "Financials.xls" — Balance Sheet tab |
| Trading asset securities | 2,034.3 / 5,084.0 | Not flagged as restricted | CapIQ "Financials.xls" — Balance Sheet tab |
| Total Cash & ST Investments (broad) | 59,644.6 / 66,675.5 | See counterparty-concentration flag below | CapIQ "Financials.xls" — Balance Sheet & Capital Structure Summary tabs |

**Counterparty-concentration flag (not a strict accounting restriction, but a real liquidity-quality issue):** `business-model/11_capital-allocation-governance.md` finds the Group parked a maximum daily cash balance of **RMB 33,988mn with the affiliated Haier Group Finance Co.** during FY2025 — about **57% of the Group's total cash & short-term investments** (RMB 59,645mn at Dec-2025) — rather than at independent banks, and drew related-party loans of RMB 3,767mn from the same entity in FY2025 (up from RMB 196mn in 2024, against a RMB 10,000mn cap). This is fully disclosed and independent-director-reviewed under HKEX Rule 14A.56, and is not "restricted cash" in the accounting sense — the company can and does draw on it — but a majority of headline liquidity sitting with a controlling-shareholder-affiliated, non-independent finance company (rather than diversified commercial banks) is a liquidity-quality flag this module carries forward, not a number to net out silently. [Business-model capital-allocation-governance cross-module input; FY2025 Annual Report (HKEX, IFRS), Board's Report "關連交易," pp.149–155]

No other restricted, trapped, or offshore-blocked cash balance is disclosed anywhere in the pool.

---

## 4. Gross & Net Debt

**FY2025 (Dec-31-2025):**

| Metric | Value (CNYmn) | Source |
|---|---:|---|
| Gross debt | 42,669.5 | CapIQ Balance Sheet / Capital Structure Summary tabs |
| − Cash & equivalents | (47,621.7) | CapIQ Balance Sheet tab |
| **Net debt (strict, §15)** | **(4,952.2)** — i.e., net cash of CNY 4,952.2mn | Computed by `earnings/01_historical-financials.md` and cross-checked by this agent: 42,669.4797 − 47,621.657441 = −4,952.18 |
| − Short-term investments − trading asset securities | (12,022.9) | CapIQ Balance Sheet tab (9,988.6 + 2,034.3) |
| **Net debt (broad, incl. investments)** | **(16,975.1)** — i.e., net cash of CNY 16,975.1mn | CapIQ's own "Net Debt" line, Capital Structure Summary / Balance Sheet tabs, ties exactly: 42,669.4797 − 59,644.570198 = −16,975.09 |

**Latest (Mar-31-2026, Q1 2026):**

| Metric | Value (CNYmn) |
|---|---:|
| Gross debt | 42,076.8 |
| Net debt (strict) | (8,503.5) — net cash |
| Net debt (broad) | (24,598.7) — net cash |

Haier is **net cash on both bases at every period shown** — there is no positive net debt figure to report for FY2021 through the latest quarter. The strict net-cash figure (cash & equivalents only) is the smaller cushion and is designated the module's canonical basis (see §7); the broad figure (also netting short-term investments and trading securities) is shown alongside, labelled, because it is material — it is roughly 3.4x the size of the strict figure at FY2025.

---

## 5. Leverage Ratios

**Inverted-scale note:** none of the ratios below are inverted scores — all are plain financial ratios (higher gross-leverage number = more debt relative to earnings; a negative net-leverage number denotes net cash).

Haier does not disclose an adjusted/non-GAAP EBITDA (`earnings/01_historical-financials.md`, §4: "the company adjusts net profit and basic EPS only... it does not publish an adjusted/non-GAAP EBITDA or EBIT"). All EBITDA figures below are the CapIQ-derived reported EBITDA (EBIT + D&A), computed from the company's own reported revenue/COGS/opex/D&A lines — there is no separate GAAP-vs-adjusted EBITDA gap to reconcile here, only a single reported EBITDA basis.

| Ratio | FY2025, on latest-year EBITDA (26,543.4) | FY2025, on peak-year EBITDA (FY2024: 28,024.6) | FY2025, on mid-cycle/normalised EBITDA (5-yr avg FY2021–25: 23,228.9) | Source |
|---|---:|---:|---:|---|
| Gross debt / EBITDA | 1.61x | 1.52x | 1.84x | Computed: 42,669.5 ÷ EBITDA base (this agent, CapIQ Income Statement + Balance Sheet tabs) |
| Net debt / EBITDA (strict, canonical) | (0.19x) — net cash | (0.18x) — net cash | (0.21x) — net cash | Computed: (4,952.2) ÷ EBITDA base |
| Net debt / EBITDA (broad) | (0.64x) — net cash | (0.61x) — net cash | (0.73x) — net cash | Computed: (16,975.1) ÷ EBITDA base |
| Debt / capital | 25.3% | — (n/a, single-period ratio) | — (n/a) | CapIQ Capital Structure Summary tab, FY2025 (42,669.5 ÷ 168,646.5 total capital — ties to CapIQ's own stated 25.30%) |
| Debt / equity (attributable to shareholders) | 36.0% | — (n/a) | — (n/a) | Computed: 42,669.5 ÷ 118,698.4 (Total Common Equity, CapIQ Balance Sheet tab) |

**Cyclical EBITDA-basis row, as required by MODULE_RULES (company flagged cyclical per `business-model/07_business-quality.md`):** the table above already shows all three bases side by side. FY2024 (EBITDA CNY 28,024.6mn, EBITDA margin 9.80%) is the company's own **peak/cyclical high-water mark**, per `07_business-quality.md`; FY2025's EBITDA of CNY 26,543.4mn sits between that peak and the CNY 23,228.9mn five-year (FY2021–FY2025) **mid-cycle/normalised average**. Because net debt is negative at every period, higher-denominator (peak) EBITDA does not meaningfully change the *conclusion* (net cash either way) — but it matters for the *gross*-leverage read: gross debt/EBITDA is 1.52x on peak EBITDA and rises to 1.84x on the more conservative mid-cycle average, a reminder that if margins revert toward the five-year average rather than holding near the FY2024 peak, gross leverage is running about 20% higher than the latest-year ratio implies.

**Reconciliation flag — a CapIQ-internal inconsistency, not a filing discrepancy:** CapIQ's own "Capital Structure Summary" tab states a different Total Debt/EBITDA for FY2025: **1.51x** (and Net Debt/EBITDA "NM"), versus the 1.61x computed above from CapIQ's own Income Statement (EBITDA) and Balance Sheet (Total Debt) tabs for the same period. Working the Capital Structure Summary tab's own subsidiary ratios backward (e.g., Total Debt/(EBITDA−Capex) = 2.191288x on Total Debt of 42,669.5 implies an EBITDA input of ≈CNY 28,328mn) shows CapIQ's credit-ratio engine is using an EBITDA figure roughly CNY 1,785mn higher than the Income Statement tab's reported FY2025 EBITDA (26,543.4) — most likely a different vintage/definition inside CapIQ's own ratio calculator, not a value that appears in the company's own filings (Haier does not disclose EBITDA at all, per above). Per CLAUDE.md §5, the figures in the ratio table above are computed transparently from the two source tabs' own reported EBITDA and Total Debt lines (reproducible, shown as CNYmn ÷ CNYmn), rather than the pre-computed Capital Structure Summary ratio, which is cited here only to flag the gap for the record: [CapIQ "Financials.xls" — Capital Structure Summary tab, FY2025: "Total Debt/EBITDA 1.506483"].

---

## 6. Leverage Trend

**Net debt basis shown: strict (§15 default; canonical basis, see §7).**

| Metric | FY2023 | FY2024 | FY2025 | Latest (Mar-31-2026) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, CNYmn) | (23,065.2) | (15,949.5) | (4,952.2) | (8,503.5) | Net-cash cushion shrank sharply FY2023→FY2025, then partially rebuilt in Q1 2026 |
| Net debt / EBITDA (strict) | (0.97x) | (0.57x) | (0.19x) | (0.33x)¹ | Same pattern |

¹ Latest-quarter ratio uses the LTM EBITDA to Mar-31-2026 (CNY 25,950.2mn): (8,503.5) ÷ 25,950.2 = (0.328x).

Haier's net-cash cushion has narrowed on both the strict and broad bases every year from FY2022 through FY2025 — net debt (strict) moved from CNY (24,316.9)mn in FY2022 to CNY (4,952.2)mn in FY2025, a swing of roughly CNY 19.4bn toward less net cash, even as EBITDA grew over the same window (CNY 19,678.9mn → CNY 26,543.4mn). The driver is not operating deterioration: total gross debt rose from CNY 29,845.3mn (FY2022) to CNY 42,669.5mn (FY2025), a 43% increase — including two new Medium-Term Notes issued in 2025 (CNY 3,500mn combined, at cheap fixed coupons of 1.66–1.99%) — while cash & broad liquid investments grew only about 6% over the same period (CNY 56,324.5mn → CNY 59,644.6mn). The gap was driven mainly by a large step-up in shareholder distributions: dividends paid rose from CNY 5,153.2mn (FY2022) to CNY 13,873.4mn (FY2025), and the payout ratio rose from ~35% to ~71% of net income over that period, with share buybacks (CNY 1,233.6mn) starting in FY2025 [`business-model/11_capital-allocation-governance.md`; CapIQ "Financials.xls" — Cash Flow tab]. Q1 2026 shows a partial reversal — net debt (strict) improved (more net cash) to CNY (8,503.5)mn as both short-term borrowings and cash & investments rose together — but one quarter is not enough data to call this a trend reversal rather than normal seasonal or opportunistic financing timing.

---

## 6A. HoldCo / OpCo & Structural Subordination (if applicable)

| Item | Evidence | Why It Matters |
|---|---|---|
| Where debt sits | Every instrument in the Section 1 debt stack — term loans, the two Medium-Term Notes, and the finance leases — is denominated in CNY and sits at the consolidated group / listed-parent level (Haier Smart Home Co., Ltd., SHSE:600690); no instrument in the CapIQ Capital Structure Details is attributed to a named subsidiary. | No evidence of structural subordination within the onshore debt stack — all creditors rank pari passu, senior, at the same consolidated entity. |
| One identified offshore item | CapIQ's Fixed Income Securities Summary lists a "Perpetual" preferred security issued by **Haier Smart Home UK & I Limited**, a UK subsidiary, ultimate parent Haier Smart Home Co., Ltd. — but every amount field (offering amount, currency, price) is blank ("-"). This instrument's size cannot be confirmed from this pool. | If material, this would sit structurally junior/offshore relative to the group's onshore senior debt and would need its own subordination read; given the blank amount fields and its complete absence from the (evidently comprehensive — reconciles exactly to the balance sheet) onshore Capital Structure Details, this agent's working assumption is that it is immaterial, but this is **not confirmed** from the data pool. |
| Upstreaming constraints | No dividend-blocker, capital-control, or regulatory upstreaming restriction is disclosed anywhere in the pool for any subsidiary. China maintains standard capital-account controls on RMB conversion/repatriation at the sovereign level, but no company-specific constraint is disclosed. | Not disclosed in the data pool — flagged, not assumed benign. |
| Material restricted / trapped cash | None disclosed as a formal restricted-cash balance-sheet line (see §3). The one liquidity-quality flag is the related-party concentration of cash with Haier Group Finance Co. (§3) — a counterparty-concentration issue, not a jurisdictional trapped-cash issue. | Net debt is not overstated or understated by a hidden restricted-cash pool on the evidence available; the counterparty concentration is a separate risk already flagged. |

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

The following are the numbers every other solvency agent in this module should use verbatim, unless a specific reason is stated for departing from them:

- **Reporting currency: RMB (CNY), millions.**
- **Gross debt (FY2025, Dec-31-2025): CNY 42,669.5mn.** Latest (Mar-31-2026): CNY 42,076.8mn.
- **Net debt — canonical basis: strict (§15 default).** FY2025: **net cash of CNY 4,952.2mn** (i.e., net debt = CNY (4,952.2)mn). Latest (Mar-31-2026): net cash of CNY 8,503.5mn. The **broad** basis (also netting short-term investments and trading securities) is materially larger and is shown alongside, labelled, wherever cited downstream: FY2025 net cash of CNY 16,975.1mn; latest net cash of CNY 24,598.7mn. **Reason strict is canonical:** it is the module's stated default (§15) and is the more conservative of the two readings — it does not assume short-term investments and trading securities are as instantly liquid as cash & equivalents.
- **Cash & liquid investments (FY2025): CNY 59,644.6mn broad total** (cash & equivalents CNY 47,621.7mn + short-term investments CNY 9,988.6mn + trading asset securities CNY 2,034.3mn). **Liquidity-quality flag:** ~57% of this figure (CNY 33,988mn, maximum daily balance) sat with the affiliated Haier Group Finance Co. in FY2025 rather than independent banks (§3) — downstream liquidity-runway work (`03`) should carry this flag rather than treat all cash as equally accessible/diversified.
- **EBITDA base used: CNY 26,543.4mn, FY2025, reported (not adjusted — the company does not disclose an adjusted EBITDA).** Cycle position: FY2025 sits between the company's own cyclical peak (FY2024: CNY 28,024.6mn) and the five-year (FY2021–FY2025) mid-cycle/normalised average of CNY 23,228.9mn. All three bases are given in §5 for downstream stress-testing (`06`).
- **Net debt / EBITDA (canonical, strict basis):** (0.19x) on latest-year EBITDA; (0.18x) on peak (FY2024) EBITDA; (0.21x) on mid-cycle/normalised EBITDA — **net cash on every basis.** On the broad net-debt basis: (0.64x) latest-year; (0.61x) peak; (0.73x) mid-cycle — also net cash on every basis.
- **Gross debt / EBITDA:** 1.61x latest-year; 1.52x peak (FY2024); 1.84x mid-cycle/normalised — all computed transparently from CapIQ's own Income Statement and Balance Sheet tabs (§5); flag that CapIQ's own separate Capital Structure Summary tab states a different figure (1.51x) for the same period, likely reflecting an internal EBITDA-definition/vintage mismatch inside that CapIQ product, not a filing figure (§5 detail).
- **Haier is net cash, not net debt, at every period from FY2021 through the latest quarter.** Per MODULE_RULES §8 and CLAUDE.md §24 Filter 3, this is a **positive strategic-flexibility signal** — it funds counter-cyclical action (holding staff, supporting suppliers/dealers, buying assets cheap, continued dividend/buyback capacity) if China's property-linked appliance demand or US tariff/consumer conditions worsen — not evidence of an "under-levered" or "lazy" balance sheet, and this module does not suggest Haier should add debt to optimize its cost of capital.
- **The trend to carry downstream is a narrowing net-cash cushion, not a swing into net debt.** Net debt (strict) moved from CNY (24,316.9)mn (FY2022) to CNY (4,952.2)mn (FY2025) — leverage is rising off a very light base, driven by rising shareholder distributions (dividend payout ratio ~35%→~71%, plus buybacks resuming) and two new fixed-coupon bond issuances, not by any operating deterioration (EBITDA and revenue both grew over the same window). `02` (maturity wall) should note the coarse fiscal-year-end bucketing of most short-term bank debt; `03` (liquidity runway) should carry the related-party cash-concentration flag; `06` (stress test) should use the mid-cycle/normalised EBITDA of CNY 23,228.9mn as one of its bases given the cyclicality flag.
- **No adjusted-EBITDA or estimated figure underlies any number above** — all figures are either directly stated in a CapIQ tab or computed by this agent using a stated, reproducible formula from CapIQ's own reported line items. The one open item that is *not* confirmed is the size of the UK subsidiary's perpetual preferred security (§6A) — treated as immaterial pending confirmation, not included in any total above.
