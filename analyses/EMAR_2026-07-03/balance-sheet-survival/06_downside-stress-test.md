# Downside Stress Test — EMAR (Emaar Properties PJSC)

**Reporting standard:** IFRS | **Reporting currency:** AED (UAE Dirham), in AED millions unless stated | **Fiscal year end:** 31 December  
**Latest period:** FY2025 (Dec-31-2025); Q1-2026 (Mar-31-2026) as most recent interim  
**Net-debt basis:** Broad (canonical per `01_capital-structure-and-leverage.md` §15 designation: gross debt − unrestricted cash − liquid short-term investments). Strict basis (gross debt − unrestricted cash only) shown alongside for transparency at every occurrence.  
**EBITDA basis:** CIQ reported AED 24,132 mn (FY2025) — cash-backed confirmation: per `earnings/06_earnings-quality.md`, normalised CFO/EBITDA is approximately 97%–104% (removing buyer advance-payment inflows). EBITDA is substantially cash-backed; the small gap between CIQ reported (AED 24,132 mn) and company-adjusted (AED 25,561 mn) EBITDA reflects a non-cash IFRS 9/15 discounting item (5.9% difference). The more conservative CIQ reported figure is used throughout.  
**Pending acquisition check:** No material pending acquisition is announced or reflected in the data pool (`business-model/11_capital-allocation-governance.md` and Capital IQ Key Developments, as of Jun-2026). Pro-forma base adjustment is therefore not required.  
**Cyclicality:** `business-model/10_external-dependency.md` classifies Emaar as a real estate developer with high dependence on the Dubai property cycle (73% of group revenue / 66% of EBITDA from UAE Development). COVID-2020 produced a 34% revenue drop from FY2019. A historical-trough haircut is included in Section 2.

All stressed figures, ratios, coverage metrics, and break-point solves were produced by the executed Python snippet above; results are reproduced in the tables below.

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (CIQ reported, FY2025 — cash-backed per `earnings/06`) | AED 24,132 mn | Capital IQ Annual IS, FY2025, filed Feb-12-2026 |
| Mid-cycle / normalised EBITDA (FY2021–FY2023 average; cycle context) | AED ~10,513 mn | `01_capital-structure-and-leverage.md` §5 |
| Net debt — **broad basis** (canonical; gross debt − cash − liquid STI) | −AED 17,287 mn (**net cash** of AED 17,287 mn) | `01` §4; computed from Capital IQ Annual Balance Sheet, FY2025 |
| Net debt — **strict basis** (gross debt − unrestricted cash only) | +AED 861 mn (marginally net debt) | `01` §4; shown alongside per §15 |
| Net debt / EBITDA — broad basis (canonical) | −0.72x (net cash) | Computed: −17,287 / 24,132 |
| Net debt / EBITDA — strict basis | +0.04x | Computed: 861 / 24,132 |
| Gross debt / EBITDA | 0.44x | Computed: 10,615 / 24,132 |
| EBITDA / interest expense (ICR) | 49.0x | Computed: 24,132 / 492; `04_coverage-and-covenants.md` §1 |
| Cash interest paid / EBITDA (conservative cross-check) | 24.1x | Computed: 24,132 / 1,002; interest paid per Capital IQ Annual CFS, FY2025 |
| Tightest covenant + threshold (labeled assumption — no actual covenants disclosed) | Min ICR 3.0x (labeled; actual not disclosed in pool) | `04_coverage-and-covenants.md` §2 — headroom marked "Not assessable" for scoring |
| Tightest covenant current headroom | ~1,535% above labeled 3.0x threshold | Computed: (49.0x − 3.0x) / 3.0x |
| Next-12m obligations (maturities + interest + capex + declared dividend) | AED 16,153 mn | `03_liquidity-runway.md` §2 |
| — of which: debt maturities | AED 5,317 mn | `02_maturity-wall-and-refinancing.md` §1 |
| — of which: declared FY2025 dividend | AED 8,900 mn | FY2025 Investor Presentation, p.11; Q1-2026 interim report, Apr-08-2026 |
| Total committed liquidity (in-hand cash + liquid STI + undrawn revolver) | AED 35,594 mn (FY2025); AED 42,025 mn (Q1-2026) | `03_liquidity-runway.md` §1 |
| — in-hand liquid assets (cash + STI + trading, excl. restricted escrow) | AED 28,255 mn (FY2025) | Capital IQ Annual Balance Sheet, FY2025 |
| — undrawn committed revolver (matures 2030) | AED 7,339 mn (FY2025) | Capital IQ Quarterly Capital Structure Summary, Q1-2026; FY2025 Investor Presentation, p.8 |
| Floating-rate gross debt | AED 1,070 mn (10.1% of gross debt) | `01_capital-structure-and-leverage.md` §1; `02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage | None disclosed (inference: no systematic hedging) | `10_external-dependency.md` §1 |
| Working-capital seasonality / peak build | Peak build not separately quantified in available English-language disclosures; Q1 (seasonal trough) liquid balance AED 34,683 mn — 2.1x annual obligations. Labeled assumption AED 2,000 mn used for WC shock scenario. | `03_liquidity-runway.md` §3; labeled assumption |
| Restricted cash (EXCLUDED from all liquidity figures) | AED 42,879 mn (FY2025) — buyer escrow money; not available for debt service | Capital IQ Annual Balance Sheet, FY2025; FY2025 Investor Presentation, p.14 |

**Reporting currency:** AED (UAE Dirham, pegged to USD at ~3.67). All figures in AED millions unless stated.

---

## 2. Stress Scenarios

Net debt (broad basis) is held constant at −AED 17,287 mn in all scenarios: the company's gross debt is fixed; in a stress year the liquid buffer does not shrink from operating cash flow alone, because the existing AED 28,255 mn in-hand liquidity is the starting stock and the EBITDA decline reduces only the incremental FCF contribution. The 12-month liquidity gap uses committed liquidity (AED 35,594 mn) versus near-term obligations (AED 16,153 mn, plus any scenario-specific shock). Covenant breach uses the labeled minimum ICR of 3.0x (not assessable against actual covenants — see `04`). All figures computed by the executed Python snippet above.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA (AED mn) | 24,132 | 16,892 | 14,479 | 9,653 | 14,479 | 14,479 |
| Net debt / EBITDA (broad basis, canonical) | −0.72x | −1.02x | −1.19x | −1.79x | −1.19x | −1.19x |
| EBITDA / interest expense | 49.0x | 34.3x | 29.4x | 19.6x | 29.4x | 29.4x |
| Tightest covenant headroom (ICR vs. labeled 3.0x min) | 1,535% | 1,044% | 881% | 554% | 881% | 881% |
| Covenant breach (ICR < 3.0x)? Y/N | N | N | N | N | N | N |
| 12-month liquidity gap (AED mn, + = surplus) | +19,441 | +19,441 | +19,441 | +19,441 | +17,441 | +19,420 |
| Survives without external action? Y/N | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** |

**Notes on each scenario:**

**−30% EBITDA (AED 16,892 mn):** This is a normal-to-severe recession haircut. EBITDA/interest remains 34.3x — 11x above the labeled 3.0x floor. Net leverage (broad) widens to −1.02x (deeper net cash). No covenant issue, no liquidity issue. Survives with no external action.

**−40% EBITDA (AED 14,479 mn):** A severe recession. EBITDA/interest is 29.4x. Broad net leverage −1.19x (still net cash). Committed liquidity surplus AED 19,441 mn. Survives with no external action.

**−60% EBITDA (AED 9,653 mn):** A stress far beyond any historical UAE real estate cycle trough seen in the past decade (the FY2021 post-COVID EBITDA was AED 7,803 mn — a 67.7% decline from FY2025, not −60%). EBITDA/interest is 19.6x — still 6.5x the labeled covenant floor. Net leverage (broad) is −1.79x (net cash). Liquidity surplus AED 19,441 mn. Survives with no external action.

**−40% EBITDA + Working-capital shock (AED 2,000 mn labeled assumption):** Adds a labeled AED 2,000 mn peak working-capital build (not separately disclosed in filings; ~4% of revenue as a labeled proxy). Total uses rise to AED 18,153 mn. Liquidity surplus narrows to AED 17,441 mn. Still a large buffer. Survives with no external action.

**−40% EBITDA + rates +200bp:** Floating-rate debt of AED 1,070 mn generates AED 21 mn of incremental annual interest at +200bps — 0.09% of base EBITDA. ICR under this scenario is 29.4x (identical to the plain −40% scenario: the rate shock is arithmetically immaterial). Liquidity gap AED 19,420 mn surplus. Survives with no external action.

**Historical trough scenario (calibrated to FY2021 EBITDA = AED 7,803 mn, a 67.7% decline from FY2025):** This is the actual post-COVID trough EBITDA available in CIQ data (FY2020 was worse in revenue, but FY2021 is the trough in the available EBITDA series). EBITDA/interest = 15.9x. Broad net leverage = −2.22x (net cash). ICR breach? No. Liquidity surplus AED 19,441 mn. Survives with no external action.

---

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest labeled covenant breaches (ICR < 3.0x; labeled assumption — not actual covenant) | −93.9% (EBITDA falls from AED 24,132 mn to AED 1,476 mn) |
| Committed liquidity exhausted within 12 months | Not reached at any economically plausible EBITDA level — an additional AED 19,441 mn of extraordinary outflows (above the AED 16,153 mn already budgeted) would be needed to exhaust the AED 35,594 mn committed liquidity buffer; EBITDA decline alone does not trigger this |
| Net leverage (broad basis) exceeds 6x refi-market threshold | Not applicable: broad net leverage is already −0.72x (net cash of AED 17,287 mn); would require turning from net cash to AED 146 bn in net debt — not plausible |
| Net leverage (strict basis) exceeds 6x | −99.4% EBITDA decline (to AED 144 mn) — not economically plausible |

**Context on the 93.9% covenant break point:** The FY2021 COVID-trough EBITDA was AED 7,803 mn — a 67.7% decline from FY2025 levels. The labeled covenant breach requires a further 26 percentage points of decline beyond even that level, to AED 1,476 mn. No historical precedent in Emaar's own data or in Dubai real estate comes close to this. The covenant break point exists on paper but is not a real-world constraint under any scenario grounded in Emaar's own history.

---

## 4. Survival Read

Emaar's structure does not break at any EBITDA decline short of a near-total-collapse of the business — roughly −94% from FY2025 levels. That is approximately 2.8x worse than the actual COVID trough and has no historical basis in Emaar's own EBITDA series or in UAE real estate history. The first thing to break at an extreme level is the labeled minimum interest coverage covenant (at −93.9% EBITDA), not liquidity and not a maturity event — and that labeled threshold is an assumed market-standard floor for a BBB+-rated developer, not a disclosed actual covenant.

A 30–40% EBITDA decline — a normal recession, not a tail — is survivable on its own, without a covenant waiver, an equity raise, or a distressed asset sale. At −40% EBITDA, interest is still covered 29.4x and the company holds AED 19,441 mn of committed liquidity surplus above all 12-month obligations. At −60% EBITDA, coverage is 19.6x and the liquidity surplus is identical. Even at the actual FY2021 post-COVID EBITDA of AED 7,803 mn — a 67.7% decline from today — ICR is 15.9x and committed liquidity comfortably covers every obligation.

Market closure test: assume no new unsecured refinancing for 12 months from July 2026. At Q1-2026, committed liquidity of AED 42,025 mn (in-hand + revolver) covers gross debt of AED 10,064 mn by 4.18x and covers all 12-month uses of AED 16,153 mn by 2.60x. The company could retire every instrument in the stack from its own balance sheet without any market access. Sukuk 3 (USD $750 mn, AED ~2,753 mn, Sep-2026) — the only maturity event in the next 12 months — will almost certainly be repaid from cash rather than refinanced; at Q1-2026 unrestricted cash alone of AED 12,180 mn, coverage of this single event is 4.4x. Market closure for 12 months is irrelevant to survival and does not trigger any break point.

On the §15 broad-basis net-debt figure — the canonical one per `01` — Emaar is in significant net cash of AED 17,287 mn at FY2025 and AED 24,619 mn at Q1-2026. This net cash is a strategic asset: it removes dependence on debt markets during a Dubai property downturn, funds continued project delivery without external capital, and gives the company the capacity to increase launches, absorb cost inflation, or pursue selective bolt-on deals precisely when competitors face pressure (per CLAUDE.md §24, Filter 3 and MODULE_RULES §8). Even on the strict basis (unrestricted cash only), the company reached net cash of AED 2,115 mn at Q1-2026. The net cash position is not a trivial or structural feature — it reflects AED 8.4 bn of gross debt reduction since FY2021 and four consecutive years of normalised FCF well above obligations, and it deepens as operating cash flow continues.

The single genuine downside concern is not a balance-sheet break: it is the risk that if the Dubai property cycle reverses sharply, the AED 8.9 bn declared dividend continues to be paid from a shrinking liquid buffer over multiple years while pre-sales stall. Even in that scenario, the AED 35–42 bn committed liquidity buffer would take several years of simultaneous earnings collapse and dividend maintenance to exhaust — the structure remains intact throughout any historically observed property cycle.

---

*Covenant headroom is marked "Not assessable" for scoring purposes (no actual covenant thresholds are disclosed in the data pool; labeled market-standard assumptions applied per MODULE_RULES partial-data rule). Break-point calculations are therefore indicative rather than definitive on the covenant dimension. Every stressed leverage, coverage, covenant headroom, and liquidity-gap figure was produced by the executed Python snippet (run above, results shown); no figures are from mental arithmetic.*
