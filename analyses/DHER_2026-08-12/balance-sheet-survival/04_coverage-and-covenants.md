# Coverage & Covenants — DHER

Reporting currency: EUR million, unless stated otherwise. Reporting standard: IFRS as adopted by the EU. All figures below are FY2025 (period-end 31-Dec-2025) unless labeled otherwise, taken from `01_capital-structure-and-leverage.md` (debt/EBITDA base) and the Capital IQ workbook `Delivery Hero SE XTRA DHER Financials.xls` (Income Statement, Cash Flow, Capital Structure Summary tabs). No FY2025 audited Annual Report PDF is in the data pool — the covenant *narrative* below is sourced from the FY2024 Annual Report (the only audited annual filing in the pool) and flagged wherever it is carried forward, consistent with `00_solvency-data-triage.md` and `01`.

## 1. Coverage Ratios

DHER discloses two EBITDA bases with a large gap between them (§15 hygiene): **Reported (GAAP-derived) EBITDA** of €304.9m (FY2025) and the company's own non-GAAP **Adjusted EBITDA** of €903.0m (FY2025) — a €598.1m difference that is 66% of the adjusted figure itself [Delivery Hero SE XTRA DHER Financials.xls, Income Statement tab; `earnings/06_earnings-quality.md`, §7]. Interest is stated **gross** — €382.1m, the Income Statement's "Interest Expense" line — per the module rule to use gross interest unless net interest is disclosed and justified; net interest expense (net of €99.0m interest/investment income) is €283.1m, and cash interest actually paid per the cash-flow statement is €246.5m [Delivery Hero SE XTRA DHER Financials.xls, Income Statement & Cash Flow tabs, FY2025].

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest — Reported EBITDA basis | 0.80x (304.9 / 382.1) | Computed; Income Statement tab, FY2025 |
| EBITDA / interest — Adjusted EBITDA basis | 2.36x (903.0 / 382.1) | Computed; Income Statement tab & FY2025 Earnings Call, FY2025 |
| EBIT / interest | 0.25x (93.7 / 382.1) | Computed; Income Statement tab, FY2025 — **ties exactly** to the CIQ Ratios tab's own precomputed "EBIT / Interest Exp." line (0.245223), one of the only vendor ratios that reconciles cleanly |
| (EBITDA − capex) / interest — Reported basis | −0.06x ((304.9 − 325.8) / 382.1) | Computed; capex = PP&E capex €171.0m + capitalized intangibles €154.8m = €325.8m, Cash Flow tab, FY2025 |
| (EBITDA − capex) / interest — Adjusted basis | 1.51x ((903.0 − 325.8) / 382.1) | Computed |
| Fixed-charge coverage — Reported EBITDA basis | −0.03x | Computed, see formula below |
| Fixed-charge coverage — Adjusted EBITDA basis | 0.86x | Computed, see formula below |

Fixed-charge coverage = (EBITDA − capex) / (gross interest + 12-month scheduled debt amortization + 12-month lease principal). Scheduled amortization = short-term borrowings €86.1m + current portion of long-term debt €74.7m = €160.8m; lease principal due in the next 12 months = €126.9m (the "Cap. Lease Payment Due +1" line; lease *interest* is left out of this add-on because IFRS 16 lease interest is already embedded in the €382.1m gross interest-expense line, so adding the interest-inclusive €148.8m lease-payment figure on top would double-count it) [Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Summary tab, FY2025]. Denominator = 382.1 + 160.8 + 126.9 = **€669.8m**. On Reported EBITDA: (304.9 − 325.8) / 669.8 = **−0.03x**. On Adjusted EBITDA: (903.0 − 325.8) / 669.8 = **0.86x** — even on the company's own preferred non-GAAP profit measure, Adjusted EBITDA minus capex does not fully cover interest plus the next 12 months of scheduled debt and lease principal.

**Vendor-ratio reconciliation note (consistent with `01`'s flag):** the CIQ Ratios tab's own precomputed "EBITDA / Interest Exp." (1.19x, FY2025) and "(EBITDA-CAPEX) / Interest Exp." (0.74x, FY2025) do **not** reconcile to either disclosed EBITDA base (304.9 or 903.0) divided by the disclosed €382.1m interest-expense line — the same unexplained-EBITDA-base problem `01` already flagged for the vendor's leverage sub-table. This report's ratios above are computed directly from the disclosed Income Statement and Cash Flow lines, not from the vendor's precomputed ratio row, except for EBIT/interest, which is the one line that does tie out exactly.

**EBITDA cash-backing caveat (materially above cash-backed EBITDA):** `earnings/06_earnings-quality.md` finds FY2025 cash conversion (CFO ÷ Adjusted EBITDA) collapsed to **8.8%** — Adjusted EBITDA grew 30% to €903.0m while CFO fell 87.5% to just €79.5m [`earnings/06`, §1–2]. The practical consequence for coverage: FY2025 **operating cash flow itself did not cover cash interest paid** — CFO €79.5m ÷ cash interest paid €246.5m = **0.32x**. The 2.36x Adjusted-EBITDA/interest ratio above is an accrual-accounting coverage figure; the cash actually generated in FY2025 covered less than a third of the cash interest bill, before any principal repayment. Read the 2.36x figure with that gap explicitly in view — it is not "comfortable coverage," it is an accrual number sitting well above a cash reality that came in at less than a third of the interest bill.

## 2. Covenant Inventory

The Group's only disclosed maintenance financial covenant, attached to the Revolving Credit Facility (RCF) and the term facilities, is a **minimum-liquidity covenant, tested quarterly at Group (consolidated) level — not a debt/EBITDA leverage or interest-coverage covenant**: "a financial covenant, which implies the maintenance of a minimum liquidity level for the Group, on a quarterly basis... In case of an infringement... the RCF might be terminated" [FY24 Annual Report, Note F.10, p.178; confirmed again in the Risk Report section, p.235-ish region of the same filing: "The RCF and term facilities are subject to a financial covenant, which requires the maintenance a minimum liquidity at Group level"]. As of 31-Dec-2024 (the latest audited date) the Group states it complied with this covenant and expected to remain compliant over the following twelve months [same source]. **The exact numeric threshold was searched for directly in the extracted annual-report text and was not found anywhere in the pool** — confirmed by a targeted search across the full annual-report text for "minimum liquidity," "leverage ratio," "interest cover," and "financial covenant"; the covenant's existence, direction (a floor), and testing frequency are disclosed, but not its level.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | **Not disclosed — no such covenant exists per the filing** ("not a debt/EBITDA leverage covenant" [`01`, §1]) | 2.78x net debt/Adj. EBITDA (§5 of `01`, for reference only, not a covenant test) | N/A — no leverage covenant | FY24 Annual Report, Note F.10 |
| Min interest coverage | **Not disclosed — no such covenant found in the filing** | 2.36x Adjusted-EBITDA/interest (§1 above, for reference only, not a covenant test) | N/A — no coverage covenant | FY24 Annual Report, Note F.10 |
| Min liquidity (Group level, quarterly) | **Numeric level not disclosed in this pool** | Cash & equivalents €2,112.7m (FY2025) [`01`, §3] | **Not assessable precisely — see indicative computation below** | FY24 Annual Report, Note F.10, p.178 |
| Springing covenant trigger (e.g. revolver utilization threshold) | Not disclosed — the filing text does not describe the covenant as springing on a utilization threshold; it appears to apply on a standing quarterly basis regardless of RCF drawn amount | RCF fully undrawn (€0 drawn, €461.8m undrawn of €600.0m committed, FY2025) [`01`, §1] | Not applicable — "Not disclosed in the data pool" per module hard rule | FY24 Annual Report, Note F.10 |
| Equity cure rights (Y/N, limits) | **Not disclosed in the data pool** | — | — | Not found in extracted text |
| Cross-default / change-of-control | Cross-default-adjacent language present ("an infringement of such covenant" at Group level triggers RCF termination); explicit change-of-control clause text for the convertible bonds or term facilities — directly relevant given the pending Uber acquisition approach — was **not located** in the extracted text | — | — | FY24 Annual Report, Note F.10 (cross-default); Uber Technologies, Inc., Delivery Hero SE - M&A Call, Jul-16-2026 (deal context, no clause text) |

**Indicative headroom computation (LABELED ASSUMPTION, per the module's partial-data rule):** because the numeric threshold is undisclosed, a market-typical minimum-liquidity covenant range for a large-cap, B-rated issuer's RCF is used as a labeled assumption — €100m to €500m — and headroom is computed against FY2025 cash of €2,112.7m using the MIN/floor formula, headroom = (actual − threshold) / threshold:

| Assumed threshold (labeled assumption, not from filings) | Headroom |
|---:|---:|
| €100m | +2,013% |
| €200m | +956% |
| €300m | +604% |
| €500m | +323% |
| €1,000m (deliberately extreme, to stress-test the assumption itself) | +111% |

Even at an unusually high assumed threshold (€1,000m — roughly half of current cash, well above typical minimum-liquidity covenant design), headroom stays strongly positive. This directional read (wide headroom under any plausible threshold) is a genuine finding; the *precise* percentage is not, because the threshold itself is inference, not from filings. **Per the module partial-data rule, covenant headroom is marked "Not assessable" for scoring purposes** — the direction (very likely far from breach) can be stated, the number cannot be certified.

One caveat narrows this: of the FY2024 cash base (€3,808.7m), **€624.4m sat in bank accounts pledged as collateral for the Dollar/KRW Term Facilities** — usable operationally but encumbered by a security interest [`01`, §3/§6A; FY24 Annual Report, Note F.10]. A comparable FY2025 pledged-cash figure is not disclosed in this pool. If the covenant's own definition of "liquidity" excludes pledged cash (unknown — not disclosed), unencumbered cash would still be roughly €1,488m on the FY2024 proxy ratio, and the headroom conclusion above is unchanged in direction.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Not applicable** — the sole disclosed maintenance covenant is a minimum-*liquidity* test, not an EBITDA-based leverage or coverage covenant, so there is no covenant-EBITDA definition to state | FY24 Annual Report, Note F.10 |
| Addbacks permitted (types) | Not applicable (no EBITDA-based covenant) | — |
| Addback caps / limits | Not applicable | — |
| Is covenant EBITDA materially above reported EBITDA? | Not applicable — but flagged for context: the company's own headline **Adjusted EBITDA** (€903.0m, FY2025) already runs 196% above Reported EBITDA (€304.9m) via addbacks including €224.1m of stock-based compensation (24.8% of Adjusted EBITDA) [`earnings/06`, §4] — if any future refinancing introduces an EBITDA-based covenant, this addback-heavy definition is the one likely to be proposed, and the "addback illusion" risk the module flags would then apply directly | `earnings/06_earnings-quality.md`, §4, §7 |

Because the disclosed covenant is liquidity-based rather than EBITDA-based, the standard "addback illusion" risk this module tests for does not currently apply to DHER's actual maintenance covenant — but it would be the first thing to scrutinize if the capital structure is refinanced (relevant given the pending Uber deal) into a more conventional leverage-covenant structure.

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | Minimum-liquidity covenant (RCF/term facilities, Group level, quarterly test) — the **only** disclosed maintenance covenant, so it is the tightest by default |
| Headroom on tightest covenant (%) | Not assessable precisely (numeric threshold undisclosed); indicatively very wide — +604% to +2,013% across a €100m–€500m assumed-threshold range (§2) |
| EBITDA decline that would breach it (approx.) | **Not the direct mechanical driver** — this covenant tests cash liquidity, not earnings, so an EBITDA decline only threatens it indirectly, by weakening operating cash flow over time. Given FY2025's already-weak cash conversion (CFO/Adjusted EBITDA 8.8%, `earnings/06`), even a modest further EBITDA deterioration would compound an already-thin cash-generation year; a quantified EBITDA-decline breach trigger cannot be computed without the liquidity threshold |
| Debt increase that would breach it (approx.) | Not computable without the threshold; qualitatively, the covenant is tested on Group liquidity, not on debt levels, so a debt increase would only threaten it through added interest/principal cash service, not directly |
| Illustrative cash-burn runway to an assumed threshold | At FY2025's normalized operating free cash flow of −€246.3m/year (CFO €79.5m − total capex €325.8m, `earnings/01_historical-financials.md`), FY2025 cash of €2,112.7m would take roughly **7.4–8.2 years** to burn down to an assumed €100m–€300m threshold if that FCF run-rate continued unchanged — illustrative only, not a forecast, and ignores the company's own guided (extraordinary-items-excluded) FCF of +€250m for FY2025, which `earnings/06` finds excludes an implied ~€600–650m of legal/regulatory cash outflows |

## 4. Coverage / Covenant Read

Earnings do not comfortably carry DHER's interest bill on a cash basis: FY2025 operating cash flow (CFO €79.5m) covered only 0.32x of the €246.5m cash interest actually paid, and (Adjusted EBITDA − capex) covers gross interest at 1.51x — positive, but resting on a non-GAAP profit measure that is €598.1m (66%) above the GAAP-derived EBITDA figure, and on a cash-conversion rate (8.8%) that collapsed from 92.2% the prior year [`earnings/06`, §1–2]. On the covenant side, DHER's only disclosed maintenance test is a Group-level minimum-liquidity covenant with an undisclosed numeric threshold; against €2,112.7m of FY2025 cash, headroom is very likely wide under any plausible threshold assumption, but cannot be certified as a number and is marked "Not assessable" for scoring per the module's partial-data rule. The single move most likely to actually tighten this covenant is not a one-quarter EBITDA miss but a sustained continuation of FY2025-style negative operating free cash flow (−€246.3m) combined with crystallization of the disclosed €440–770m contingent liability or further multi-jurisdiction rider-classification cash costs — a slow multi-year cash drain, not a sudden trip, is the realistic breach path given the size of the current cash buffer.

**Out-of-scope note:** this report stays within the covenant/coverage scope defined for this agent; it does not build the maturity wall (agent `02`), assess liquidity runway in months (agent `03`), or run the downside EBITDA stress test (agent `06`) — those are produced separately and should be read alongside this one.
