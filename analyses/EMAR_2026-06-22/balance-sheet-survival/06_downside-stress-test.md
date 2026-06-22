# Downside Stress Test — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS | **Currency:** AED (UAE Dirham), in millions unless stated
**Fiscal year end:** 31 December | **Jurisdiction:** UAE — DFM / SCA
**Latest period for balance sheet:** Q1-2026 (Mar-31-2026); income statement: FY2025 (Dec-31-2025)
**Net-debt basis:** §15 strict (gross debt − unrestricted cash & equivalents only); broad basis shown alongside, labelled. Restricted project-escrow cash (AED 43 Bn) is excluded from every figure in this report.
**Run date:** 2026-06-22

**Upstream inputs consumed:** `01_capital-structure-and-leverage.md`, `02_maturity-wall-and-refinancing.md`, `03_liquidity-runway.md`, `04_coverage-and-covenants.md`, `05_off-balance-sheet-and-contingencies.md`; cross-module: `business-model/10_external-dependency.md`, `business-model/11_capital-allocation-governance.md`, `earnings/03_margin-drivers.md`, `earnings/06_earnings-quality.md`

**Pending-acquisition check (step 2a):** `business-model/11_capital-allocation-governance.md` confirms no pending or recently-announced material external acquisition. The two transactions in the review period (Emaar Malls all-share de-listing merger, Nov-2021; full consolidation of Dubai Creek Harbour, Dec-2022) were internal consolidations of entities already equity-accounted — not third-party debt-funded M&A. No pro-forma adjustment is required. [FY2024 Annual Report, Governance Report p.100–103; Preliminary Annual Report FY2025 (Feb-12-2026), p.4–6]

---

## 1. Base Case (today)

All figures in AED millions. EBITDA is the FY2025 reported figure from Capital IQ (Operating Income + D&A). Cash-backed check: normalised operating FCF per `earnings/06_earnings-quality.md` = AED 24,295 mn in FY2025 — within 0.7% of reported EBITDA of AED 24,132 mn. The two figures are effectively identical; reported EBITDA is used throughout as the base (no inflation by non-cash items). The company-adjusted EBITDA (AED 25,561 mn) removes a non-cash IFRS 9 interest-unwinding item and is shown for reference but not used as the stress base (conservative choice).

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (reported, cash-backed; FY2025) | AED 24,132 mn | Capital IQ Annual Income Statement + Ratios, FY2025 |
| Mid-cycle / normalised EBITDA (FY2021–FY2025 5-yr avg ~AED 14,647 mn; rounded conservative) | AED 14,000 mn | `01_capital-structure-and-leverage.md`; FY2021–FY2025 Capital IQ Annual IS |
| Net debt — strict basis (§15 canonical; FY2025 year-end) | AED +861 mn | `01`; gross debt AED 10,615 mn − unrestricted cash AED 9,754 mn |
| Net debt — strict basis (Q1-2026; most recent) | AED −2,115 mn (net cash) | `01`; gross debt AED 10,064 mn − unrestricted cash AED 12,180 mn |
| Net debt — broad basis (incl. liquid STI; FY2025) | AED −17,287 mn (net cash) | `01`; labelled — broad basis, not canonical |
| Net debt / EBITDA (strict, FY2025) | 0.04x | Computed: 861 / 24,132 |
| Net debt / EBITDA (strict, mid-cycle EBITDA) | 0.06x | Computed: 861 / 14,000 |
| EBITDA / Interest (FY2025) | 49.0x | `04`; 24,132 / 492 |
| EBITDA / Interest (mid-cycle EBITDA) | 28.4x | Computed: 14,000 / 492 |
| Tightest covenant + threshold | Min EBITDA/Interest ≥ 3.0x **[ASSUMED — no covenant disclosure in pool; see `04`]** | `04_coverage-and-covenants.md`; labeled assumption for typical IG UAE bank RCF |
| Tightest covenant headroom (current) | 93.9% | Computed: (49.0 − 3.0) / 49.0 |
| Next-12-month obligations | AED 16,092 mn | `03_liquidity-runway.md`; comprises debt maturities AED 5,182 mn + cash interest AED 1,002 mn + capex AED 934 mn + dividends AED 8,839 mn + IFRS 16 current AED 135 mn |
| Committed liquidity (strict: unrestricted cash + committed undrawn RCF) | AED 19,522.5 mn | `03`; cash Q1-2026 AED 12,179.5 mn + undrawn committed RCF AED 7,343.0 mn |
| Static 12-month liquidity surplus (committed liquidity − uses) | AED +3,430 mn | Computed: 19,522.5 − 16,092 |
| Floating-rate debt (gross) | AED ~990 mn | `01`/`02`; PKR revolving (KIBOR-linked), AED EIBOR revolver, EGP revolving |
| Hedge coverage (if any) | Not disclosed | `01`; no cross-currency or interest-rate hedge disclosure in pool |
| Working-capital seasonality / peak build | Not applicable — advance-payment model is structurally inverted (cash collected before revenue recognised); no conventional seasonal WC drain | `03_liquidity-runway.md`; earnings/06_earnings-quality.md |

**EBITDA cycle-position note:** FY2025 EBITDA of AED 24,132 mn is at or near the peak of the current off-plan sales cycle; the FY2020 trough was approximately AED 5,500 mn (a 77% decline from peak). The mid-cycle EBITDA of AED 14,000 mn is approximately the five-year average and is the conservative normalised base used alongside the peak figure throughout. [Capital IQ Annual IS, FY2021–FY2025; `01`; `business-model/10_external-dependency.md`]

---

## 2. Stress Scenarios

All figures computed by executed Python snippet (output shown in this agent's run). Net debt is held fixed at the FY2025 year-end strict basis (AED 861 mn) in every scenario — the debt stock does not change within 12 months from EBITDA alone; EBITDA falls cut FCF and future free cash, not the existing net debt level. The working-capital shock (−40% + WC column) adds AED 2,478 mn to net debt (5% of FY2025 revenue of AED 49,557 mn — a labeled assumption, not from filings, applied because no conventional seasonal WC build is disclosed and Emaar's business does not have a standard WC cycle). The rate shock applies +200 bps to the AED 990 mn floating-rate exposure: additional interest = AED 19.8 mn, which is immaterial (0.08% of base EBITDA).

Covenant thresholds are assumed (not disclosed): max net debt/EBITDA ≤ 3.5x and min EBITDA/interest ≥ 3.0x. Breach determinations are against these assumed thresholds; true covenants are not in the data pool. The historical-trough scenario (−77%) is calibrated to the FY2020 actual trough EBITDA of approximately AED 5,500 mn. [Capital IQ Annual IS, FY2021; `01`; `business-model/10`]

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + Rates +200 bp | −77% (Hist. trough) |
|---|---:|---:|---:|---:|---:|---:|---:|
| EBITDA (AED mn) | 24,132 | 16,892 | 14,479 | 9,653 | 14,479 | 14,479 | 5,500 |
| Net debt — strict (AED mn) | 861 | 861 | 861 | 861 | 3,339 | 861 | 861 |
| Net debt / EBITDA (x) | 0.04x | 0.05x | 0.06x | 0.09x | 0.23x | 0.06x | 0.16x |
| EBITDA / Interest (x) | 49.0x | 34.3x | 29.4x | 19.6x | 29.4x | 28.3x | 11.2x |
| Tightest cov. headroom (coverage; assumed 3.0x floor) | 93.9% | 91.3% | 89.8% | 84.7% | 89.8% | 89.4% | 73.2% |
| Covenant breach? (Y/N) | N | N | N | N | N | N | N |
| 12-month static liquidity gap (AED mn; + = surplus) | +3,430 | +3,430 | +3,430 | +3,430 | +952 | +3,430 | +3,430 |
| Survives without external action? | YES | YES | YES | YES | YES | YES | YES |

**Column notes:**
- **−40% + WC shock:** WC shock of AED 2,478 mn (5% of revenue; labeled assumption) is added to net debt and subtracted from the static liquidity surplus. The surplus shrinks to AED 952 mn — positive, but thin. Even so, FCF at −40% EBITDA is still strongly positive (AED ~11,356 mn post-tax estimate), making the full runway self-funding.
- **−40% + Rates +200 bp:** Additional interest AED 19.8 mn on AED 990 mn floating debt. Coverage falls from 29.4x to 28.3x — immaterial. Rate exposure is not a survival risk. The AED/USD peg means UAE monetary policy tracks the US Fed; a +200 bp shock to EIBOR and KIBOR simultaneously would be a large macro event, yet the cash-flow impact on Emaar is negligible.
- **−77% (Hist. trough):** Calibrated to the approximate FY2020 EBITDA (COVID year). Coverage is 11.2x — still 3.7x above the assumed 3.0x floor. Net leverage is 0.16x. The company survives even the deepest episode in its own recorded history.

**Rate shock — "not applicable" qualifier:** The +200 bp column is included per MODULE_RULES. Given that floating-rate debt is only ~9.3% of gross debt (AED 990 mn of AED 10,615 mn), the rate shock is practically immaterial. It is labelled as "not a survival factor."

**WC shock — basis:** No seasonal WC build is disclosed for Emaar. The advance-payment model means cash is collected before revenue is recognised — the conventional WC drain does not apply. The 5% of revenue assumption (AED 2,478 mn) is a labeled conservative proxy, not from filings. Even with this shock applied simultaneously with −40% EBITDA, the static liquidity surplus remains positive.

---

## 3. Break Points

Break-point calculations are from executed Python snippet. The tightest assumed covenant is min EBITDA/interest ≥ 3.0x. Liquidity exhaustion is defined as committed liquidity (cash + committed undrawn RCF) falling below zero within 12 months. The refi-market threshold used is 6x net leverage (standard IG credit-market discomfort zone).

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest assumed covenant breaches (EBITDA/interest < 3.0x on peak EBITDA base; computed: EBITDA falls to AED 1,476 mn = 3.0 × AED 492 mn interest) | −93.9% from peak EBITDA (AED 24,132 mn → AED 1,476 mn) |
| Tightest assumed covenant breaches on mid-cycle EBITDA base (AED 14,000 mn; same AED 1,476 mn threshold) | −89.5% from mid-cycle (further decline from AED 14,000 mn → AED 1,476 mn) |
| Committed liquidity exhausted within 12 months (static basis: committed liquidity AED 19,522.5 mn vs 12m uses AED 16,092 mn; surplus = AED 3,430 mn; exhausted if unplanned outflows > AED 3,430 mn AND FCF is negative) | FCF goes negative when EBITDA < AED 1,426 mn (interest AED 492 mn + capex AED 934 mn); requires −94.1% decline from peak |
| Net leverage (strict) exceeds 6x (net debt AED 861 mn; at 6x, EBITDA = 861/6 = AED 144 mn) | −99.4% from peak (effectively impossible from current net debt level; on Q1-2026 net-cash basis, breach is impossible for any positive EBITDA) |

**Critical observation:** Every single break point requires an EBITDA collapse of 89–99%. The FY2020 historical trough — the actual worst year on record — produced a −77% decline from peak and did not come close to any break point. The structure does not break at −30%, −40%, or −60%. It does not break at the historical trough. The only scenario that gets near a break point is one where EBITDA falls to approximately AED 1,476 mn — 94% below the current level — which has no plausible single-year mechanism for a company with AED 154.8 Bn of locked-in revenue backlog and AED 12.2 Bn of unrestricted cash.

---

## 4. Survival Read

Emaar's balance sheet does not break at any EBITDA haircut tested — not at −30%, not at −40%, not at −60%, and not at the historical trough of −77% (the actual FY2020 COVID year). The first assumed covenant breach (min interest coverage ≥ 3.0x) requires EBITDA to fall from AED 24,132 mn to AED 1,476 mn — a 94% collapse — which has no plausible single-year path for a company where the revenue backlog of AED 154.8 Bn locks in roughly three to four years of recognizable revenue at current delivery rates. Even if the Dubai property market froze entirely and no new unit was sold from tomorrow, the backlog alone would sustain EBITDA well above any break point for multiple years. Committed liquidity of AED 19,522.5 mn (unrestricted cash plus the AED 7,343 mn committed revolving credit) exceeds 12-month obligations of AED 16,092 mn by AED 3,430 mn before a single dirham of FCF is generated; FCF at any EBITDA above AED 1,426 mn is positive and adds further. A −40% EBITDA scenario — a severe recession, not a tail — leaves coverage at 29.4x and net leverage at 0.06x on the strict basis.

**Market closure test:** Assume no new unsecured sukuk issuance is possible for 12 months. The Sukuk Series 3 (AED 2,752.6 mn, due September 2026) is covered 4.4x by unrestricted cash at Q1-2026 (AED 12,179.5 mn). After retiring it, AED 9,427 mn of unrestricted cash remains — still more than enough for the AED 684 mn 2027 maturity bucket. The company is fully self-funded under 12-month market closure; no new issuance, no revolver draw, and no asset sale is required.

**Net-cash status and strategic optionality:** At Q1-2026, Emaar is net cash on the strict basis (AED −2,115 mn), and deeply net cash on the broad basis (AED −24,619 mn including liquid short-term investments). Per MODULE_RULES §8 and CLAUDE.md §24 Filter 3, this is a **fortress survival outcome**: the company not only survives every haircut without external action but retains the capacity to accelerate land acquisitions, support JV partners, hold construction staffing, and fund launches counter-cyclically precisely when competitors are distressed — the highest strategic value of low leverage. This is not a "lazy balance sheet"; it is a balance sheet designed for a long-cycle, high-volatility real estate market where access to capital at the bottom of the cycle is the competitive moat.

**Caveats:** (1) Covenant thresholds are assumed, not from filed documents — true headroom could differ if actual covenants are more restrictive, though at 0.04–0.09x net leverage and 11–49x coverage, no plausible covenant design triggers breach at any tested haircut. (2) The restricted project-escrow cash (AED 43 Bn) is never usable for debt service, and this report excludes it throughout. (3) JV partner liquidity calls (off-balance-sheet, from `05`) remain an unquantified wildcard; at AED 2,675 mn of known Note 16 contingent obligations, they are absorbable even at the −77% EBITDA trough. (4) The DMTT (UAE Domestic Minimum Top-Up Tax, 15%, effective 2025) is a permanent new tax drag not yet fully audited in available filings — it reduces net income and FCF but does not affect the EBITDA-level break points used in this test.

---

## Self-Check

- [x] Haircuts of −30%, −40%, −60% run; historical-trough scenario calibrated to FY2020 actual (−77%) and labelled.
- [x] Each scenario recomputes net leverage, coverage, covenant headroom (breach Y/N), and 12-month liquidity gap.
- [x] Base EBITDA is cash-backed (normalised FCF AED 24,295 mn vs reported EBITDA AED 24,132 mn; difference <1%; reported EBITDA used with caveat).
- [x] Break points solved explicitly: coverage breach at −93.9%; liquidity exhaustion and FCF-zero at −94.1%; 6x leverage at −99.4%.
- [x] Each scenario states whether survival requires external action (all scenarios: NO).
- [x] No pending acquisition — pro-forma step skipped, documented.
- [x] No probability assigned to any scenario.
- [x] Net-debt basis: strict (§15 canonical), broad labelled and shown, restricted escrow excluded throughout.
- [x] All stressed figures, break-point solves, and coverage ratios produced by executed Python snippet (output shown in agent run), not by mental arithmetic.
- [x] No banned phrases.
- [x] Net-cash result treated as fortress outcome and strategic optionality — not labelled as "lazy" or averaged away.
- [x] Covenant thresholds are labeled assumptions (not from filed documents per `04` partial-data rule).
- [x] WC shock column included with labeled-assumption basis (5% of revenue; non-standard model because advance-payment structure inverts the conventional WC cycle).
- [x] Rate shock column included; immateriality quantified (AED 19.8 mn additional interest = 0.08% of base EBITDA).
- [x] Market closure test run and stated.

---

*Sources: Capital IQ Annual Financials (Income Statement, Balance Sheet, Cash Flow), FY2021–FY2025; Capital IQ Quarterly Balance Sheet, Q1-2026; FY2025 Preliminary Annual Report / Investor Presentation (Feb-12-2026); FY2024 Annual Report (IFRS, audited, filed Mar-14-2025); `01_capital-structure-and-leverage.md`; `02_maturity-wall-and-refinancing.md`; `03_liquidity-runway.md`; `04_coverage-and-covenants.md`; `05_off-balance-sheet-and-contingencies.md`; `business-model/10_external-dependency.md`; `business-model/11_capital-allocation-governance.md`; `earnings/03_margin-drivers.md`; `earnings/06_earnings-quality.md`*
