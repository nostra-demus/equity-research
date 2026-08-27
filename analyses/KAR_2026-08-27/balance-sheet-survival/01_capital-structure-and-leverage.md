# Capital Structure & Leverage — KAR

Karoon Energy Ltd (ASX: KAR), Australian-incorporated upstream oil & gas producer (Baúna/Patola, Santos Basin, Brazil — operated; Who Dat/Dome Patrol/Abilene, Gulf of America — non-operated), reports under IFRS as adopted by the AASB, in **US dollars** despite its ASX/AUD listing [FY2025 Annual Report, cover / accounting policies]. Reporting currency for every figure below is **USD** unless stated otherwise. Fiscal year: the company changed its year-end from 30 June to 31 December (a 6-month transition period, "TY23," sits between the last old-convention year and FY2024); the latest audited balance sheet is **FY2025, year ended 31-Dec-2025**, filed 26-Feb-2026 [FY2025 Annual Report]. No `ciq_facts.json` or `relationships.json` sidecar exists for this run (confirmed absent in `00_solvency-data-triage.md`); every figure below is this agent's own sourced read, cross-checked between the Capital IQ workbook exports and the primary Annual Report.

Corporate credit rating: **S&P B (Stable), Fitch B (Stable)** — sub-investment-grade [Karoon Energy Ltd ASX KAR Fixed Income Summary.xls, "Summary" tab; FY2025 Annual Report, Note 17]. Business-model cross-checks (`business-model/10_external-dependency.md`) flag Karoon as **high commodity-cyclicality** — ~93% of production is oil/liquids-weighted, FY2025 revenue and EBITDAX moved almost entirely with the realised oil price, and the company runs fully unhedged as of the latest filing — so leverage is shown below on both the latest-year and a mid-cycle/normalised EBITDA basis per MODULE_RULES.md §4.

## 1. Debt Stack

FY2025 (31-Dec-2025), reporting currency **USD**, in US$ millions.

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Short-term debt / current portion | $0.0m (no short-term borrowings); current portion of leases $0.7m | Group (operating subsidiaries) | Yes (lease) | Senior | Leased asset | N/A | N/A | FY2025 Annual Report, Consolidated Statement of Financial Position, p.79 |
| Bonds / notes — Second Priority Senior Secured Notes | $350.0m principal ($337.7m carrying value, net of $12.3m unamortized transaction costs) | **Karoon USA Finance Inc.** (US financing subsidiary), guaranteed by Karoon Energy Ltd (ASX parent) and certain subsidiaries | Yes — Second Priority Senior Secured | Senior | Various Group assets, incl. Baúna/Patola and Who Dat | May 2029 (2029-05-01 per CIQ Capital Structure export; 2029-05-14 per CIQ Fixed Income Securities export — filing states "May 2029" without a specific day; small day-level discrepancy between the two vendor exports, flagged) | Fixed, 10.50% coupon, semi-annual | FY2025 Annual Report, Note 17 Borrowings, p.106-107; Karoon Energy Ltd ASX KAR Fixed Income Summary.xls |
| Term loans | None outstanding | — | — | — | — | — | — | FY2025 Annual Report, Note 17 |
| Revolver — Secured Syndicated Reserves-Based Lending (RBL) Facility | $0 drawn; $340.0m committed, fully undrawn at 31-Dec-2025 | **KEI (Brazil Santos) Pty Ltd, KEI Finance 1 Pty Ltd, Karoon Petróleo & Gás Ltda** (operating subsidiaries), guaranteed by Group members comprising ≥90% of EBITDAX and ≥90% of total assets | Yes — secured | Senior | Baúna/Patola and Who Dat assets | 30-Sep-2028; amortising facility — subject to semi-annual borrowing-base redetermination and a facility-reduction schedule commencing 31-Mar-2026 | Floating, term SOFR + margin (margin not disclosed in the extracted filing pages) | FY2025 Annual Report, Note 17, p.106; Karoon Energy Ltd ASX KAR Financials.xls, Capital Structure Details tab |
| Finance / capital leases | $1.1m total ($0.7m current + $0.4m non-current) | Group (operating entities) | Yes | Senior | Leased asset(s) | Various (short remaining terms) | N/A | FY2025 Annual Report, Note 14 Leases; Consolidated Statement of Financial Position, p.79 |
| **Total gross debt** | **$338.8m carrying value ($351.1m principal/face value)** | — | — | — | — | — | — | FY2025 Annual Report, Notes 14 & 17 (reconciled); Karoon Energy Ltd ASX KAR Financials.xls, Capital Structure Summary tab |

**Note on the FPSO lease and IFRS 16:** the $1.1m lease-liability total is a sharp fall from $177.7m at FY2024 — almost the entire prior lease balance was the Baúna FPSO (floating production, storage and offloading vessel) charter, which Karoon bought out during 2025 (a $35.3m "Gain on disposal of FPSO right-of-use asset" was recognised) [FY2025 Annual Report, p.78, Note 3(b)]. This is an IFRS 16-capitalised lease already sitting on the balance sheet as debt, not an off-balance-sheet operating lease — see §2.

**Note on the vendor "Total Debt" figure:** the Capital IQ "Total Debt Outstanding" line ($338.8m) is confirmed by direct reconciliation to equal Note 17 Borrowings (carrying value, $337.7m) plus Note 14 Lease liabilities ($1.1m) — both audited balance-sheet line items — so it is the more complete, filing-tied figure. The company's own "Net debt" glossary metric (used in its Financial Overview / Three Year Summary tables) instead uses the **$350.0m face/principal value** of the Notes (excluding unamortized transaction costs) and **excludes lease liabilities entirely** ("Net debt: Total borrowings (excluding transaction costs) less cash and cash equivalents" [FY2025 Annual Report, Glossary, p.140]). At FY2025 the gap between the two constructions is small ($338.8m vs $350.0m gross, an ~$11.2m difference) because the FPSO lease had already shrunk to $1.1m. **At FY2024 the same gap was much larger**: the company's own metric showed gross debt of $350.0m (Notes only) and net debt of just $8.8m at 31-Dec-2024, while the audited balance sheet actually carried $511.2m of total debt (Notes $333.5m + FPSO lease $177.7m) and $170.0m of net debt — a **$161.2m (≈1,833%) gap** between the company's own narrow metric and the fully reconciled balance-sheet figure at that date [FY2025 Annual Report, "THREE YEAR SUMMARY" p.141; Karoon Energy Ltd ASX KAR Financials.xls, Balance Sheet & Capital Structure Summary tabs]. This is flagged because a reader relying on the company's own headline "net debt" figure alone would have materially understated total debt-like obligations as recently as twelve months before this report's balance-sheet date.

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Restoration/decommissioning provision (Baúna, US GoM) | $278.4m non-current, on balance sheet (up from $214.2m FY2024, +$64.2m: $53.7m re-measurement + $10.5m discount unwinding) | Recognised liability under AASB 137 — not a financial-debt instrument, but a large, growing obligation; backed by a **BRL 843.8m (US$153.4m equivalent) surety bond** provided to Brazil's ANP regulator (June 2025) and a **BRL 117.7m (US$21.4m equivalent) parent-company guarantee** — both off-balance-sheet security instruments collateralising the already-recognised provision, not incremental liabilities | FY2025 Annual Report, Note 15 Provisions, p.104-105 |
| Deferred acquisition consideration — Petrobras (Baúna earn-out) | $34.2m fair value recognised on balance sheet ($27.4m current + $6.8m non-current), against an undiscounted maximum of **up to $285m** | Embedded derivative / other financial liability, oil-price-linked; not classified as "debt" by the company but is a real deferred cash obligation contingent on oil prices | FY2025 Annual Report, Note 16(a)(i), Note 18, p.105/108 |
| Deferred acquisition consideration — Pacific Exploration & Production Corp. | Up to $5.0m, **not recognised** on balance sheet (contingent on first production ≥1 MMboe from specified blocks) | Contingent liability, not provided for | FY2025 Annual Report, Note 16(a)(i), p.105 |
| Pension / OPEB underfunding | $0.1m net liability at FY2025 (immaterial; peaked at $0.5m in FY2021) | No formal defined-benefit pension plan; this is a small long-service-leave-type liability, not a funded pension scheme | Karoon Energy Ltd ASX KAR Financials Pension OPEB.xls |
| Preferred equity | None | Not applicable — no preferred shares on issue | FY2025 Annual Report, Consolidated Statement of Financial Position, p.79 |
| Operating leases (IFRS 16 vs US GAAP note) | No material operating leases outside the recognised $1.1m finance-lease balance | Karoon reports under **IFRS (AASB), which capitalises all material leases** (IFRS 16) — there is no separate off-balance-sheet "operating lease" bucket to disclose; what would be an operating lease under US GAAP is already on-balance-sheet here as the $1.1m lease-liability line in §1 | FY2025 Annual Report, Note 14 Leases |

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | $206.1m (FY2025); of which $164.4m floating-rate, $41.7m fixed-rate | No restricted or trapped cash disclosed anywhere in the FY2025 Annual Report notes read for this report; "security deposits" are a separate line item from cash & equivalents, held with rated banks as part of normal credit-risk management, not flagged as restricted | FY2025 Annual Report, Consolidated Statement of Financial Position p.79; Note 20 Financial Risk Management, p.113 |
| Liquid short-term investments | None disclosed separately — "Total Cash & ST Investments" equals cash & equivalents in the Capital IQ export (no separate investment balance) | N/A | Karoon Energy Ltd ASX KAR Financials.xls, Balance Sheet tab |
| Restricted / trapped cash (flag) | None disclosed | N/A — flag is negative (no restriction found) | FY2025 Annual Report — no "restricted cash" line item found in a full-text read of the Notes |

## 4. Gross & Net Debt

FY2025 (31-Dec-2025), US$ millions. Basis: **strict** (cash & equivalents only; no short-term investments to net in — see §3, none disclosed). This is the canonical basis for the module.

| Metric | Value | Source |
|---|---:|---|
| Gross debt | $338.8m (carrying value, incl. leases: Notes $337.7m + leases $1.1m) | FY2025 Annual Report, Notes 14 & 17 (reconciled) |
| − Cash & equivalents | $206.1m | FY2025 Annual Report, p.79 |
| **Net debt (strict, §15)** — canonical | **$132.7m** | Derived: $338.8m − $206.1m; ties to CIQ Balance Sheet "Net Debt" FY2025 |
| Company's own labelled net-debt metric (for cross-reference, same strict cash basis, but debt side = $350.0m face value of Notes only, leases excluded) | $143.9m | FY2025 Annual Report, "THREE YEAR SUMMARY" p.141: "$350.0m total debt (ex lease liabilities and transaction costs) − $206.1m cash" |
| − Liquid short-term investments | None disclosed | — |
| **Net debt (broad, incl. investments)** | Not applicable — no liquid short-term investments disclosed beyond cash & equivalents | — |

**Basis note:** both figures above are strict (cash-only); they differ only in how "total debt" is constructed — the canonical $132.7m ties every dollar to the audited balance sheet's own Notes 14 (Leases, $1.1m) and 17 (Borrowings, $337.7m carrying value, i.e. net of unamortized issuance costs), while the company's own $143.9m glossary metric uses the Notes' undiscounted $350.0m face value and drops the (now-small) lease liability. The $132.7m figure is designated canonical for this module because it reconciles exactly to the primary financial statements' own recognised balance-sheet liabilities; §1 shows why this distinction mattered far more at FY2024 (a $161.2m gap) than it does today.

## 5. Leverage Ratios

FY2025 (31-Dec-2025). EBITDA bases, all company-disclosed non-IFRS measures unless noted: **reported "EBITDA"** $380.7m (statutory, non-IFRS, includes one-off items — see caveat below); **"Underlying EBITDAX"** $388.8m (company's own further-adjusted measure — adds back exploration & evaluation expense, strips select non-recurring items, but is *not* simply "EBITDA minus one-offs"; net effect vs reported EBITDA is a modest +$8.1m) [FY2025 Annual Report, Financial Summary p.48]. A third, independently-constructed **CIQ-standardized EBITDA** of $364.7m also exists and is used only for the mid-cycle/peer-consistent multi-year series below (§6) [Karoon Energy Ltd ASX KAR Financials.xls; reconciled in `earnings/01_historical-financials.md` §1].

| Ratio | On Reported EBITDA ($380.7m) | On Adjusted EBITDA ("Underlying EBITDAX," $388.8m) | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | 0.89x | 0.87x | Derived: $338.8m gross debt ÷ each EBITDA base |
| Net debt / EBITDA | 0.35x | 0.34x | Derived: $132.7m canonical net debt ÷ each EBITDA base |
| Debt / capital | 24.7% | (n/a) | Karoon Energy Ltd ASX KAR Fixed Income Summary.xls, "Credit Ratios" — Total Debt/Capital 24.7% (matches CIQ Capital Structure Summary: $338.8m ÷ ($338.8m + $1,032.5m total common equity) = $1,371.3m total capital) |
| Debt / equity | 32.8% | (n/a) | Karoon Energy Ltd ASX KAR Fixed Income Summary.xls, "Credit Ratios" — Total Debt/Equity 32.8% ($338.8m ÷ $1,032.5m) |

**One-off caveat this table must carry (CLAUDE.md §3 — the disagreeing number must be named):** `earnings/01_historical-financials.md` flags that FY2025 reported EBITDA of $380.7m includes a **$35.3m gain on disposal of the Baúna FPSO right-of-use asset** and a **$21.2m positive change in fair value of the Petrobras contingent consideration** — both one-off, non-operating items. Stripped ($380.7m − $35.3m − $21.2m = **$324.2m**), net debt/EBITDA on this cleaner basis would be $132.7m ÷ $324.2m = **0.41x** rather than 0.35x. Even on this stricter basis, leverage stays well under 0.5x — the qualifier changes the precision of the number, not the conclusion that gross and net leverage are low.

**Cycle position:** per `business-model/10_external-dependency.md` (external dependency score 75/100, "Mostly externally driven" — high commodity dependency, currently unhedged), Karoon is a cyclical name and a single-year figure understates fragility if that year happens to sit near a cycle peak.

| Ratio (net debt/EBITDA) | Basis | Value | Label |
|---|---|---:|---|
| Net debt / EBITDA, latest year | $132.7m ÷ $364.7m (CIQ-standardized FY2025 EBITDA) | 0.36x | Latest |
| Net debt / EBITDA, peak-year EBITDA | $132.7m ÷ $498.3m (CIQ-standardized FY2024 EBITDA — the highest of the five disclosed years) | 0.27x | **Peak — a floor, not the central estimate** |
| Net debt / EBITDA, mid-cycle/normalised | $132.7m ÷ $398.3m (3-year average of CIQ-standardized EBITDA, FY2023(Jun) $332.0m + FY2024(Dec) $498.3m + FY2025(Dec) $364.7m, ÷3) | 0.33x | **Mid-cycle / normalised** |

The FY2021-FY2022 (Jun) years are excluded from the mid-cycle average because they reflect Karoon's pre-Who Dat production ramp (revenue +125.5% FY22, +47.1% FY23) rather than a steady-state operating base — including them would blend a volume-ramp low with a price cycle rather than isolate cycle amplitude. Inference, not from filings: this 3-year average is this agent's own construction for a normalised leverage cross-check, not a company-disclosed figure. Across every basis tested — latest, peak, mid-cycle, and the one-off-stripped $324.2m EBITDA — net debt/EBITDA stays inside a narrow 0.27x-0.41x band, i.e. leverage is low under all of them, not just the most flattering one.

## 6. Leverage Trend

US$ millions. Net debt basis: **strict** (cash & equivalents only), CIQ/balance-sheet-reconciled total-debt construction (Notes 14+17), consistent with the canonical basis in §4. EBITDA basis: CIQ-standardized (for a consistent five-year series; see `earnings/01_historical-financials.md` §1 for the full reconciliation and the FY2021-2023 fiscal-year-end note).

| Metric | FY2022 (Jun) | FY2023 (Jun) | FY2024 (Dec) | FY2025 (Dec) — Latest audited | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, CIQ-reconciled basis) | $158.3m | $200.9m | $170.0m | $132.7m | Falling |
| Net debt / EBITDA | 0.77x | 0.61x | 0.34x | 0.36x | Falling, then flat |

Sources: `earnings/01_historical-financials.md` §1 (Karoon Energy Ltd ASX KAR Financials.xls, Balance Sheet / Capital Structure Summary tabs, cross-checked to the FY2025 Annual Report for the two most recent years).

Net leverage has fallen sharply since FY2022 (0.77x) to a low, stable band (0.34x-0.36x) over FY2024-FY2025, driven mainly by EBITDA growth from the Baúna/Who Dat production base outrunning debt growth — total borrowings have been essentially flat at $333.5m-$350.0m (face value) since the May-2024 issuance of the $350m Notes, which refinanced an earlier RBL draw used to fund the Who Dat acquisition [FY2025 Annual Report, Note 17]. The FY2023→FY2024 net-debt fall ($200.9m→$170.0m) and the FY2024→FY2025 fall ($170.0m→$132.7m) were funded from operating cash flow and the FPSO right-of-use buyout was paid largely from cash on hand rather than new debt [`earnings/01_historical-financials.md` §6; `business-model/11_capital-allocation-governance.md` §1]. **Subsequent to FY2025 year-end, net debt has risen materially and should be watched:** the 2Q26 Activities Report (unaudited, quarterly production/cash update, not a full balance sheet) shows net debt of $269.7m at 30-Jun-2026 (cash $80.3m, drawn debt flat at $350.0m) versus $143.9m at 31-Dec-2025 on the company's own comparable metric — a rise driven by capital expenditure (the Baúna flotel revitalisation, the SPS-92 well intervention, and the Who Dat A1 sidetrack, together $214.6m across 1Q26-2Q26) and share buybacks ($4.0m in 2Q26 alone), not by new borrowing [2Q26 Activities Report (Jul-22-2026), p.4]. This is flagged as the most current data point available but is **not** incorporated into the FY2025 canonical figures above, consistent with using the latest audited/reviewed balance sheet as the anchor.

## 6A. HoldCo / OpCo & Structural Subordination (if applicable)

| Item | Evidence | Why It Matters |
|---|---|---|
| Where debt sits (HoldCo vs OpCo) | The $350.0m Notes are issued by **Karoon USA Finance Inc.**, a wholly-owned US financing subsidiary, but are **guaranteed by the ASX-listed parent Karoon Energy Ltd and certain subsidiaries**. The $340.0m RBL facility is held at operating subsidiaries **KEI (Brazil Santos) Pty Ltd, KEI Finance 1 Pty Ltd and Karoon Petróleo & Gás Ltda**, secured against the Baúna/Patola and Who Dat operating assets and guaranteed by Group members comprising **≥90% of EBITDAX and ≥90% of total assets** | Because guarantee/security scope covers ≥90% of the Group's own EBITDAX and assets, and both instruments sit within (or are guaranteed by) entities holding the actual producing assets, there is **no material structural subordination** — the debt is effectively Group-wide obligated, not trapped below a thinly-guaranteed holding layer |
| Upstreaming constraints (dividend blockers, regulatory) | Not disclosed in the pool as a distinct restriction; the Group paid dividends and ran a buyback programme throughout FY2025 without disclosed upstreaming impediments | No evidence of a dividend blocker at either the Notes-issuer or RBL-borrower level |
| Material restricted / trapped cash | None disclosed (§3) | Net debt is not overstated or understated by a restricted-cash gap |

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

The following are the canonical figures every other solvency agent in this module should use verbatim, all as of **31-Dec-2025**, reporting currency **USD**:

- **Gross debt: $338.8m** (carrying value, incl. leases: $337.7m Notes + $1.1m leases; principal/face value $351.1m). All of it is Senior and Secured; $350.0m fixed at 10.50%; the $340.0m RBL is undrawn and would be floating (SOFR + margin) if drawn.
- **Net debt: $132.7m — strict basis (§15), CANONICAL.** Reason for choosing this over the company's own $143.9m glossary metric: it reconciles exactly to the audited balance sheet's own Notes 14 (Leases) and 17 (Borrowings), whereas the company's own figure excludes the lease liability and uses face rather than carrying value — a construction that produced a $161.2m gap from the fully reconciled figure as recently as FY2024 (§1). No broad (investment-inclusive) basis applies — no material liquid short-term investments are disclosed beyond cash & equivalents.
- **Cash & liquid investments: $206.1m** cash & equivalents; no separate liquid short-term investments disclosed; no restricted/trapped cash identified.
- **EBITDA base:** reported (company non-IFRS) EBITDA **$380.7m** — includes ~$56.5m of one-off gains (FPSO disposal gain $35.3m + Petrobras contingent-consideration fair-value gain $21.2m); a cleaner, one-off-stripped figure is **$324.2m** (labelled adjustment, see §5). Adjusted ("Underlying EBITDAX") is **$388.8m**. Cycle position: FY2025 is **not** the cycle peak — peak (of the five disclosed years) was FY2024 (Dec) at $498.3m CIQ-standardized / $450.3m company-reported; a mid-cycle/normalised 3-year average (CIQ basis) is **$398.3m**.
- **Net debt / EBITDA:** 0.35x on reported EBITDA ($380.7m); 0.34x on adjusted EBITDA ($388.8m); 0.41x on the one-off-stripped $324.2m EBITDA; 0.33x on mid-cycle/normalised EBITDA ($398.3m); 0.27x on peak-year EBITDA ($498.3m, floor, not central estimate). Across every basis, leverage sits in a narrow 0.27x-0.41x band.
- **Reporting currency: USD** (the company's stated functional and presentation currency, despite its AUD-denominated ASX listing and AUD-denominated dividends — dividend and share-price figures elsewhere in the data pool are in AUD and must carry that label if cited downstream).

Karoon is **net cash on a purely operating-cash-vs-drawn-debt view were the RBL undrawn amount included, but net debt-positive on the strict cash-only basis used here** — it carries $132.7m of net debt against $1,032.5m of equity and $338.8m of gross debt, i.e. low but not zero leverage; this is not a net-cash balance sheet. The $340.0m committed, undrawn RBL facility (secured, ≥90%-of-Group-guaranteed) is a real source of contingent liquidity beyond the cash balance, though its true point-in-time availability is subject to a semi-annual reserves-based redetermination and a facility-reduction schedule that had already reduced the commitment to $283.3m by 31-Mar-2026 per the most recent quarterly update (§6) — this reduction mechanic belongs to `02_maturity-wall-and-refinancing` and `03_liquidity-runway` to size in full. Sub-investment-grade rating (S&P B / Fitch B, both Stable) and a 10.50% coupon on the Notes reflect a levered-for-its-rating-band capital structure even though the leverage ratios themselves are low — that gap between rating and ratio-based leverage should be reconciled by `04_coverage-and-covenants`.

If any number above is estimated or based on adjusted/non-IFRS EBITDA, that caveat is stated inline; the one-off-stripped $324.2m EBITDA figure and the 3-year mid-cycle average are this agent's own constructions (labelled "Inference, not from filings" in §5) and should be carried with that label by any downstream agent that reuses them.
