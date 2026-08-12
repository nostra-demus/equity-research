# Coverage & Covenants — HAIER

**Company:** Haier Smart Home Co., Ltd. (SHSE:600690 / SEHK:6690). Household-appliance manufacturer — the Business Type Applicability Gate does not exclude this module (not a bank/insurer/REIT). Reporting currency: RMB (CNY) millions. Reporting standard: China ASBE (CAS), A-share basis (H-share/IFRS restatement shows no material difference in net profit/equity, per `01_capital-structure-and-leverage.md`).

**No `ciq_facts.json` sidecar exists for this ticker** (confirmed absent in `01`'s read of the pool), so all figures below are this agent's own sourced reads of the CapIQ workbook exports and the FY2025 Annual Report, computed transparently via an executed Python script (shown inline in the commentary) — not a mechanically pinned sidecar value.

---

## 1. Coverage Ratios

**Basis:** EBITDA = reported (not adjusted — Haier does not disclose an adjusted/non-GAAP EBITDA, per `earnings/01_historical-financials.md` §4). Interest = **gross** interest expense (the P&L "Interest Expense" line, CNY 2,679.5mn for FY2025, presented before netting against "Interest and Invest. Income" of CNY 3,249.8mn — Haier is actually a net interest *receiver*, net interest expense is only CNY 570.3mn, but gross is used here per MODULE_RULES §5 default). All figures FY2025 (year ended Dec-31-2025) unless noted.

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | **9.91x** (= 26,543.4 ÷ 2,679.5) | Computed by this agent: CapIQ "Financials.xls" — Income Statement tab, FY2025 (EBITDA 26,543.362314; Interest Expense 2,679.5) |
| EBIT / interest | **7.79x** (= 20,866.8 ÷ 2,679.5) | Computed by this agent, same source. Matches CapIQ's own precomputed Ratios-tab figure of 7.787605x exactly — the two agree for this ratio |
| (EBITDA − capex) / interest | **6.60x** (= (26,543.4 − 8,851.6) ÷ 2,679.5) | Computed by this agent: capex CNY 8,851.6mn, CapIQ "Financials.xls" — Cash Flow tab, FY2025 |
| Fixed-charge coverage | **2.04x** (= (26,543.4 − 8,851.6) ÷ (2,679.5 + 4,356.5 + 1,631.3)) | Computed by this agent. Denominator = gross interest (2,679.5) + scheduled debt amortization, proxied by the current portion of long-term loans (4,356.5, from `01_capital-structure-and-leverage.md` §1) + the next-12-month finance-lease payment (1,631.3, CapIQ "Capital Structure Summary" tab, "Cap. Lease Payment Due +1") |

**A CapIQ-internal reconciliation flag (already noted in `01`, repeated here because it affects this section directly):** CapIQ's own precomputed "Ratios" tab states a materially *higher* EBITDA/Interest for FY2025 (**10.57065x**) and Total Debt/EBITDA (**1.506483x**, vs. this agent's own 1.61x computed from the same tab's own EBITDA line) — working the numbers backward shows CapIQ's ratio engine is using an EBITDA figure of roughly CNY 28,325–28,328mn for these specific pre-computed ratios, about CNY 1,785mn (6.7%) higher than the Income Statement tab's own reported FY2025 EBITDA of CNY 26,543.4mn used above. **EBIT/Interest is the one ratio where the two CapIQ views agree exactly** (this agent's 7.79x = CapIQ's own 7.787605x), which confirms the interest-expense denominator is not the source of the gap — the discrepancy sits entirely in which EBITDA figure feeds CapIQ's internal credit-ratio calculator. Per CLAUDE.md §5, this report uses the figures computed transparently from the Income Statement tab's own reported EBITDA and Interest Expense lines (reproducible, CNYmn ÷ CNYmn, shown above), not CapIQ's separate pre-computed Ratios-tab number, for the same reason `01` gave: no filing anywhere in the pool states an EBITDA figure at all (Haier does not disclose EBITDA), so neither CapIQ figure is a filing number — the Income Statement tab's own EBITDA is simply the more transparent and internally consistent of CapIQ's two readings.

**EBITDA is cash-backed — no coverage caveat needed on that count.** `earnings/06_earnings-quality.md` finds CFO/EBITDA ran 93.9%–127.5% across FY2021–FY2025 and never fell below 93.9% in any year (FY2025: 98.0%; LTM to Mar-2026: 97.6%) — "cash conversion is genuinely strong and has never broken down." The coverage ratios above are therefore not flattered by non-cash EBITDA. The one earnings-quality caveat that *does* apply, carried from `earnings/06`: the negative cash-conversion cycle that partly supports this strong cash conversion has narrowed from −10.8 days (FY2023) to −1.2 days (FY2025) and is partly propped up by ~CNY 25bn of disclosed receivable-factoring and supplier-finance arrangements — a structural feature to watch, not a reason to discount today's EBITDA/interest coverage.

**LTM (to Mar-31-2026), for reference:** EBIT/interest 8.48x; EBITDA/interest 10.79x; (EBITDA−capex)/interest 6.99x — computed the same way (EBIT 20,385.9 / EBITDA 25,950.2 / capex 9,137.2 / interest 2,404.0). Coverage is broadly stable quarter to quarter, not deteriorating.

---

## 2. Covenant Inventory

**No maintenance-covenant disclosure exists anywhere in the data pool for Haier's own debt.** The CapIQ Fixed Income Summary states explicitly: **"There are no Indentures or Credit Agreements available for this company"** [CapIQ "Fixed Income Summary.rtf", accessed 2026-08-13]. The two Medium-Term Notes (CNY 1,500mn @ 1.99% due 2028-02-25; CNY 2,000mn @ 1.66% due 2028-06-17) are senior unsecured NAFMII/interbank-market instruments — this market format typically does not carry US-leveraged-loan-style maintenance financial covenants (max leverage, min coverage tested quarterly), and no covenant terms for these notes, or for the unsecured bank term loans that make up the bulk of the debt stack, appear in the FY2025 Annual Report's debt notes or anywhere else in the pool. A targeted search of the pool for cross-default, change-of-control, and rating-trigger language also returned nothing for Haier's own borrowings (the only "cross-default"-adjacent hits in the pool relate to unrelated corporate-governance/takeover-defense boilerplate, not debt terms). **Per the MODULE_RULES partial-data rule, this agent applies a labeled typical-market-covenant assumption below, computes indicative headroom against it, and marks true covenant headroom "Not assessable" for scoring purposes.**

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max Total Liabilities / Total Assets | **70% (assumed)** — a standard maintenance-covenant format (资产负债率不超过70%) in Chinese onshore bank-facility and bond documentation for an investment-grade-profile borrower | 57.41% (FY2025: CNY 169,818.1mn ÷ CNY 295,795.1mn) | **+18.0%** (direction: MAX/ceiling; (70% − 57.41%) ÷ 70%) | Assumption labeled *Inference, not from filings*. Actual ratio: CapIQ "Financials.xls" — Balance Sheet & Ratios tabs, FY2025 (matches CapIQ's own stated "Total Liabilities/Total Assets %" of 0.574107 exactly) |
| Max gross debt / EBITDA | **3.5x (assumed)** — a typical unsecured-facility ceiling for a non-leveraged industrial borrower (MODULE_RULES gives 4.0–4.5x as the example for a *leveraged* borrower; Haier's credit profile — net cash, unrated but no distress signal — sits well inside investment-grade territory, so a tighter assumed ceiling is the conservative choice per CLAUDE.md §4) | 1.61x (42,669.5 ÷ 26,543.4) | **+54.1%** (MAX/ceiling; (3.5x − 1.61x) ÷ 3.5x) | Assumption labeled *Inference, not from filings*. Actual ratio computed from `01_capital-structure-and-leverage.md` gross debt and this agent's Section 1 EBITDA |
| Min EBITDA / interest coverage | **3.0x (assumed)** — MODULE_RULES example band (2.0–3.0x); 3.0x used as the more conservative end | 9.91x | **+230.2%** (MIN/floor; (9.91x − 3.0x) ÷ 3.0x) | Assumption labeled *Inference, not from filings*. Actual ratio from Section 1 |
| Min liquidity / net worth | Not disclosed — no minimum-liquidity or minimum-net-worth covenant assumed (no clean typical-market analogue for this borrower type without a specific facility to anchor to) | n/a | **Not assessable** | Not disclosed in the data pool |
| Springing covenant trigger (e.g., revolver-utilization threshold) | Not disclosed — no committed revolving-credit facility with a quantified commitment/utilization figure appears anywhere in the pool (`01_capital-structure-and-leverage.md` §1 flags this: only a narrative reference to "bank credit facilities from multiple commercial banks" with no quantified total) | n/a | **Not applicable / not assessable** | Not disclosed in the data pool |
| Equity cure rights (Y/N, limits) | Not disclosed | n/a | **Not assessable** | Not disclosed in the data pool |
| Cross-default / change-of-control / rating-trigger provisions | Not disclosed for Haier's own debt instruments in this pool | n/a | **Not assessable** | Not disclosed in the data pool |

**Why the assumed thresholds, not blanks:** the partial-data rule requires a labeled typical-market covenant so the reader has a reference point, even though — and this is stated plainly — none of these three thresholds is Haier's actual contractual covenant. No real breach can be measured because no real covenant is disclosed.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Unknown — no covenant document exists to define it.** The headroom figures above use plain reported EBITDA (Section 1), not a covenant-defined EBITDA with addbacks, because no covenant-EBITDA definition is disclosed | Not disclosed in the data pool |
| Addbacks permitted (types) | Unknown | Not disclosed in the data pool |
| Addback caps / limits | Unknown | Not disclosed in the data pool |
| Is covenant EBITDA materially above reported EBITDA? | **Cannot be judged** — this is exactly the "addback illusion" risk the partial-data rule flags. Since the headroom above is computed on reported EBITDA (which is well cash-backed at 98.0% CFO/EBITDA per `earnings/06`, so it is not itself inflated), the illustrative headroom is not overstated by an addback-inflated EBITDA — but this says nothing about what a *real* covenant, if one exists in an undisclosed bank facility, would define as covenant EBITDA | Not disclosed in the data pool — headroom quality on any real (undisclosed) covenant is unknown |

**Per MODULE_RULES score-cap table: "No covenant disclosure" → Covenant headroom = "Not assessable"; "Covenant headroom relies on assumed covenant-EBITDA addbacks" → Covenant headroom capped at 60 even where indicative headroom is computed.** Both caps apply here.

---

## 3. Headroom & Breach Proximity

**All figures below are against the labeled assumed covenants in Section 2 — indicative only, not a real contractual breach distance.**

| Metric | Value |
|---|---:|
| Tightest covenant (by % headroom, among the assumed set) | Max Total Liabilities/Total Assets (assumed 70% ceiling) |
| Headroom on tightest covenant (%) | **+18.0%** |
| EBITDA decline that would breach it (approx.) | **Not directly meaningful** — this is a balance-sheet leverage ratio, not an EBITDA-driven one; a pure EBITDA decline (with debt and other liabilities held flat) does not move this ratio. See note below |
| Debt increase that would breach it (approx.) | **≈ +CNY 124,128mn of additional liabilities** (holding equity constant, funded liabilities and assets rising together) — about **2.9x today's entire CNY 42,669.5mn gross debt stack**. This is a very large absolute buffer despite the "only" 18.0% relative headroom, because the 70%-of-assets base (CNY 295,795mn) is large relative to Haier's actual debt |

**Second-tightest, and the more operationally meaningful covenant for a stress test:** the assumed max gross debt/EBITDA ceiling of 3.5x has +54.1% headroom and would break on either a **54.1% EBITDA decline** (EBITDA falling from CNY 26,543.4mn to CNY 12,191.3mn, debt held flat) or a **+117.7% increase in gross debt** (from CNY 42,669.5mn to CNY 92,901.8mn, EBITDA held flat). The assumed min-coverage floor (3.0x EBITDA/interest) has the widest headroom of the three (+230.2%) and would need a **69.7% EBITDA decline** (interest held flat) to breach.

**Read:** by strict percentage, the balance-sheet-ratio covenant is "tightest," but it is the least sensitive to a plausible operating shock — breaching it requires either a debt increase roughly triple the current stack or an asset write-down of similar scale, neither plausible from an EBITDA-driven downside alone. The debt/EBITDA covenant (+54.1% headroom, breaks on a ~54% EBITDA decline) is the more operationally relevant tightest constraint for `06_downside-stress-test` to carry forward, since it is the one an EBITDA haircut can actually move.

---

## 4. Coverage / Covenant Read

Earnings comfortably carry interest by the numbers: EBITDA/interest of 9.91x and EBIT/interest of 7.79x (FY2025, gross interest basis) sit well above any plausible maintenance-covenant floor, and the underlying EBITDA is cash-backed (CFO/EBITDA 98.0% FY2025, per `earnings/06_earnings-quality.md`), so this is not a coverage ratio propped up by non-cash accruals. No real covenant is disclosed anywhere in the pool — CapIQ states outright that no indenture or credit agreement is available for this borrower — so the covenant-headroom figures above are all labeled assumptions, not contractual facts, and covenant headroom is marked **Not assessable** for scoring. Under the illustrative assumed set, the tightest by percentage is a 70%-of-assets liabilities ceiling at +18.0% headroom, but it would take roughly 2.9x Haier's entire current debt stack in new liabilities to trip it; the more operationally exposed assumed covenant — a 3.5x max gross debt/EBITDA ceiling at +54.1% headroom — would break on a ~54% EBITDA decline or debt more than doubling, either of which is a genuine, if currently distant, downside scenario for `06_downside-stress-test` to size against.
