# Liquidity Runway — HAIER

**Company:** Haier Smart Home Co., Ltd. (SHSE:600690 / SEHK:6690). **Reporting currency: RMB (CNY), millions**, consistent with `01_capital-structure-and-leverage.md` and `02_maturity-wall-and-refinancing.md`. Basis date: **FY2025 (Dec-31-2025)**, matching `02`'s within-12-month maturity figure, which is itself anchored to the FY2025 audited balance sheet's current/non-current split. The latest quarter (Mar-31-2026) is shown alongside where relevant but is not used to build the headline runway, to keep liquidity and the 12-month uses figure on the same as-of date.

**Partial-data flag carried from `00_solvency-data-triage.md` and `01` §7:** no committed/undrawn bank-facility figure exists anywhere in this data pool — the FY2025 Annual Report states only narratively that the company "has obtained bank credit facilities from multiple commercial banks to meet working-capital needs and capex," with no quantified total. No revolver instrument was even identified in the CapIQ Capital Structure Details. Per MODULE_RULES' Partial-Data Rule and Score Cap Rules, **liquidity below excludes any revolver and is understated versus true available credit; liquidity-runway confidence is capped at 60/100.**

---

## 1. Liquidity Sources (committed only)

| Source | Amount (CNYmn) | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | 47,621.7 | Y | No restricted-cash line item found on the balance sheet. **Liquidity-quality flag (carried from `01` §3):** roughly 57% of the Group's total cash & short-term investments (a maximum daily balance of CNY 33,988mn) sat with the affiliated Haier Group Finance Co. in FY2025 rather than at independent commercial banks — fully disclosed and drawable, not a formal accounting restriction, but a concentration risk this agent flags rather than nets out silently | CapIQ "Financials.xls" — Balance Sheet tab, Dec-31-2025 |
| Liquid short-term investments | 12,022.9 (short-term investments 9,988.6 + trading asset securities 2,034.3) | Y | Not flagged as restricted | CapIQ "Financials.xls" — Balance Sheet tab, Dec-31-2025 |
| Revolver / facilities (commitment) | **Not disclosed** | No | No revolving-credit-facility line item appears anywhere in the CapIQ Capital Structure Details; only narrative language about "bank credit facilities" with no quantified amount | FY2025 Annual Report, Note 十七, §2 流动风险 (Liquidity Risk), p.238; `01` §1, `00` §3 |
| Revolver availability (if disclosed) | **Not disclosed** | N | No borrowing-base or availability figure exists in this pool — treated as "availability unknown," which per MODULE_RULES' True Liquidity Availability rule means it must be **excluded** from headline liquidity, not assumed at the commitment level | `00_solvency-data-triage.md` §3, §5 |
| **Total usable liquidity** | **59,644.6** | | Cash + liquid short-term investments only. This equals `01`'s "broad cash & ST investments" figure but is **not** a net-debt figure here — no debt is netted against it; it is gross committed liquidity, cash + liquid investments, per this agent's step-3 definition | Computed: 47,621.7 + 9,988.6 + 2,034.3 |

**Basis note:** this is understated versus Haier's true available liquidity because no committed/undrawn facility total exists in the data pool to add. There is no minimum-liquidity or springing-covenant requirement disclosed to subtract (no covenant package exists in the pool at all — `04_coverage-and-covenants.md`). Reporting currency: RMB (CNY). At Mar-31-2026 the same two components total CNY 66,675.5mn (cash CNY 50,580.3mn + short-term investments CNY 11,011.2mn + trading securities CNY 5,084.0mn) — a higher figure, shown here for reference only; it is not used in the headline calculation below because `02`'s 12-month maturity figure is built off the Dec-31-2025 balance sheet, and mixing an as-of-Mar-2026 liquidity figure against a Dec-2025-anchored uses figure would overstate the cushion.

---

## 2. Near-Term Uses (next 12 months, FY2025-anchored to match `02`)

| Use | Amount (CNYmn) | Source |
|---|---:|---|
| Debt maturities (from `02`) | 23,452.2 | `02_maturity-wall-and-refinancing.md` §1 — the within-12-months (to Dec-31-2026) current bucket: short-term unsecured/pledged/guaranteed credit loans + current portion of long-term loans + current finance-lease liabilities + current bond-interest adjustment |
| Cash interest | 2,679.5 | FY2025 income-statement "Interest Expense" line [CapIQ "Financials.xls" — Income Statement tab, FY2025]. **Data-quality flag:** CapIQ's own cash-flow-statement supplemental line "Cash Interest Paid" shows only CNY 150.9mn for FY2025 (versus a "Net Interest Exp." of CNY 570.3mn, net of interest income, on the same tab) — none of the three figures (2,679.5 gross expense / 570.3 net-of-income / 150.9 supplemental) reconcile to each other in this pool, and the 150.9 figure looks anomalously low against either. This agent uses the gross income-statement Interest Expense (2,679.5) as the conservative, best-sourced figure for the near-term-uses table; the true cash outflow is almost certainly lower once interest income (Net Interest Exp. of only 570.3 implies roughly CNY 2,109mn of interest income against a large net-cash balance sheet) is considered, but that reconciliation cannot be performed precisely from this pool |
| Maintenance capex | 8,851.6 (total capex, FY2025) | `earnings/01_historical-financials.md` §2 / `earnings/06_earnings-quality.md` fn.4. **No maintenance-vs-growth capex split is disclosed** — the FY2025 Annual Report discloses a washing-machine capacity-expansion project, so some share of this figure is growth, not maintenance, capex; using the total is the conservative (higher) reading |
| Committed dividends / buybacks | 19,873.4 (dividends 13,873.4 + buyback 6,000.0) | Dividends: FY2025 actual "Common Dividends Paid" [CapIQ "Financials.xls" — Cash Flow tab], used as a trend-based near-term expectation, **not a legally binding 12-month commitment** — Chinese A-share dividends are declared annually at the AGM following each fiscal year-end, but the payout ratio has risen from ~35% (FY2022) to ~71% (FY2025) with per-share dividend growth of 19.8%–30% every year since FY2021 [`business-model/11_capital-allocation-governance.md` §Dividend policy & coverage], making a materially lower FY2026 dividend unlikely absent a policy change. Buyback: a **new CNY 6,000mn buyback authorization was announced 2026-03-26** (part-funded for an employee share plan, unused shares to be cancelled after 3 years) — a board-approved program, distinct from FY2025's already-executed CNY 1,233.6mn buyback, but its execution pace/timing within the next 12 months is not specified, so including the full authorization amount is a conservative (maximal near-term) assumption [`business-model/11_capital-allocation-governance.md` §Net share count trajectory; Corporate Timeline.rtf, Buyback Transaction Announcement, Mar-26-2026] |
| **Total near-term uses** | **54,856.7** | Sum of the above — shown for completeness; **not** the figure used in the headline runway math below (see Section 3, net-of-FCF basis) |

---

## 3. Runway

Haier's FY2025 FCF (CFO − total capex) of CNY 17,151.3mn is positive, has been positive and broadly stable in every year FY2021–FY2025 (CNY 15,863.0mn → 12,046.8 → 15,994.2 → 16,238.0 → 17,151.3mn, per `earnings/01_historical-financials.md`), and is cash-backed: CFO/EBITDA ran 93.9%–98.0% in FY2024–FY2025 and has never fallen below 93.9% across five years [`earnings/06_earnings-quality.md` §2, earnings-quality score 66/100 — "mostly clean"]. FCF is meaningful, not negative or unreliable, so this agent uses the **net-of-FCF basis**.

| Metric | Value |
|---|---:|
| Total committed liquidity | CNY 59,644.6mn |
| Annual FCF (FY2025, CFO − total capex) | CNY 17,151.3mn |
| Basis used | **Net-of-FCF** (FCF meaningful and cash-backed) |
| Annual net cash burn (net-of-FCF basis) | CNY 26,174.3mn — see formula below |
| Monthly net cash burn (annual ÷ 12) | CNY 2,181.2mn |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **≈27.3 months** |

**Formula (net-of-FCF basis, per MODULE_RULES §8):**
`Annual net burn = (12-month debt maturities + committed dividends/buybacks) − FCF = (23,452.2 + 19,873.4) − 17,151.3 = 26,174.3`
`Monthly net burn = 26,174.3 ÷ 12 = 2,181.2`
`Runway = 59,644.6 ÷ 2,181.2 = 27.3 months`

Cash interest and maintenance capex are deliberately **not** re-added here — FCF (= CFO − total capex) already carries both cash interest paid (inside CFO) and all capex; re-adding them would double-count and understate the true runway.

**Sensitivity — if the CNY 6,000mn buyback authorization is excluded** (on the view that its 12-month execution is discretionary and unconfirmed, versus the dividend which is policy-driven): annual net burn falls to CNY 20,174.3mn, monthly burn to CNY 1,681.2mn, and the runway extends to **≈35.5 months**. The headline figure above (27.3 months) is the more conservative of the two and is retained as the reported runway.

**Cross-check — gross-obligations basis (informational only, not the headline basis since FCF is positive/meaningful):** if FCF is ignored entirely and the full Section-2 uses bucket (CNY 54,856.7mn) is treated as the annual burn with no offset, the runway would be CNY 59,644.6mn ÷ (CNY 54,856.7mn ÷ 12) = CNY 59,644.6mn ÷ CNY 4,571.4mn/month ≈ **13.0 months**. This is shown only as a stress cross-check — it is not the reported basis, since Haier's FCF is positive and cash-backed, not negative or unreliable (the trigger condition for using the gross-obligations basis).

### Seasonality / Peak Liquidity Need (Hard Check)

Household-appliance demand can be seasonal (e.g., summer air-conditioner sales, year-end restocking), but `earnings/01_historical-financials.md` §5 and `earnings/05_beat-miss-setup.md` §6 both find **seasonality cannot be confirmed** from this data pool — only one clean fiscal year (FY2025) of quarterly splits exists, and no quarter that year fell outside a 20–30% revenue-share band (Q1 26.17%, Q2 25.59%, Q3 25.65%, Q4 ~22.6%), so there is no evidence of a structurally strong or weak quarter. Separately, `earnings/06_earnings-quality.md` §3 flags that Haier's **negative cash conversion cycle has been narrowing sharply** — from −10.8 days (FY2023) to −7.0 days (FY2024) to −1.2 days (FY2025) — meaning the cushion where customers effectively pre-fund supplier payments is nearly gone; if this trend continues and the cycle turns positive, working capital would start pulling cash out of CFO rather than releasing it, independent of any seasonal pattern. **No disclosed peak-quarter working-capital cash-usage figure exists in this pool — per the Hard Check, "Peak working-capital need not disclosed — runway may be overstated."**

---

## 4. Sources & Uses Bridge

Cash on hand alone (CNY 47,621.7mn) already covers the full next-12-month debt-maturity bucket (CNY 23,452.2mn) 2.0x over, and total committed liquidity (CNY 59,644.6mn, cash + liquid short-term investments) covers the entire near-term uses bucket (CNY 54,856.7mn) 1.1x over even before counting a single yuan of FY2025 FCF — internal sources cover the next 12 months without needing external access (refinancing, an asset sale, or a facility drawdown). Of the reported ≈27.3-month runway, the large majority is already-in-hand liquidity (CNY 59,644.6mn sitting on the balance sheet today) rather than FCF that must still materialize — FCF only needs to hold near its FY2025 level (CNY 17,151.3mn) to offset roughly two-thirds of the annual maturities-plus-distributions bucket; even a full FCF shortfall to zero would still leave CNY 59,644.6mn of liquidity against CNY 43,325.6mn of 12-month maturities-plus-distributions (a 1.4x cushion), so the runway conclusion does not hinge on FCF holding up, only on its rough magnitude.

---

## 5. Liquidity Read

Haier's liquidity runway is **≈27.3 months** on the net-of-FCF basis (formula: [12-month maturities CNY 23,452.2mn + committed dividends/buybacks CNY 19,873.4mn − FY2025 FCF CNY 17,151.3mn] ÷ 12 = CNY 2,181.2mn/month monthly burn; CNY 59,644.6mn liquidity ÷ CNY 2,181.2mn = 27.3 months) — and even the more conservative gross-obligations cross-check (ignoring FCF entirely) still clears 13.0 months. This runway depends far more on cash already on the balance sheet than on FCF materializing: cash alone covers the 12-month debt wall 2.0x, and total liquidity would still cover 12-month maturities plus distributions 1.4x with zero FCF contribution. The single biggest liquidity risk is not a shortfall risk but a **data and concentration** risk: no committed/undrawn bank-facility figure exists anywhere in this pool (capping this agent's liquidity-runway confidence at 60/100 per MODULE_RULES), and roughly 57% of the Group's cash sits with the affiliated Haier Group Finance Co. rather than diversified independent banks — a disclosed, drawable, non-restricted balance, but a real counterparty-concentration exposure that a headline "cash covers everything" read should not paper over.

Out-of-scope request received: none — this report stays within the liquidity-runway mandate (source amounts, uses, and the runway calculation); it does not build the debt stack, assess covenants, or run the stress test.
