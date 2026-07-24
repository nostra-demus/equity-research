# Liquidity Runway — TSLA

**Reporting currency:** US Dollar (USD), figures in millions unless stated otherwise. **Period:** balance-sheet figures as of Jun-30-2026 [Form 10-Q, Jul-23-2026], next-12-month maturities and rate detail carried from `02_maturity-wall-and-refinancing.md`.

---

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $15,219M | Y | Already excludes restricted cash (see below) | [Q2 FY26 10-Q, Consolidated Balance Sheets] |
| Liquid short-term investments | $28,305M | Y, less $286M | $286M of this balance is "held and restricted for our insurance business" — excluded from usable total below; the remaining $28,019M is unrestricted | [Q2 FY26 10-Q, Consolidated Balance Sheets; Note 5] |
| Revolver / facilities (commitment) | $5,000M | — | RCF Credit Agreement, Tesla, Inc. (recourse, unsecured), matures Jan-2028, floating (SOFR-based) if drawn | [Q2 FY26 10-Q, Note 8] |
| Revolver availability (if disclosed) | $5,000M | Y | $0 drawn as of Jun-30-2026; not a borrowing-base facility (no borrowing-base or reserve language found in the pool), so the full commitment is treated as available, general-corporate-purpose | [Q2 FY26 10-Q, Note 8; MD&A Liquidity section] |
| **Total usable liquidity** | **$48,238M** | | $15,219 + $28,019 (ex-restricted) + $5,000 | Computed |

**Excluded / flagged, not counted in the headline figure:**
- **Warehouse Agreement, $1,500M** — **uncommitted**, secured by financing receivables/leased-vehicle interests, entered Q1 2026, $0 drawn as of Jun-30-2026. Excluded entirely per MODULE_RULES §4 (committed liquidity only) [Q2 FY26 10-Q, "Warehouse Agreement"].
- **Restricted / trapped cash, $1,206M** ($496M in prepaid expenses/other current assets + $710M in other non-current assets) — already excluded from the $15,219M cash headline, not double-counted here [Q2 FY26 10-Q, "Restricted Cash" note].
- **Foreign-currency cash, ~$3.80bn** of the cash/investments balance (USD-equivalent) is held in euros and Chinese yuan — a currency-translation exposure, not a restriction, but relevant to how freely "usable" onshore-USD liquidity converts; not quantified further in this pool [Q2 FY26 10-Q, MD&A Liquidity section].

Reporting currency: USD. No partial-data cap applies to this section — undrawn committed capacity and cash flow data are both disclosed (per `00_solvency-data-triage.md` §5).

---

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (contractual basis, from `02`) | $7,306M | `02_maturity-wall-and-refinancing.md` §1c — includes the $5,888M China Working Capital Facility, which is booked GAAP long-term on management's "intent and ability to refinance" but contractually matures Sep-2026–Mar-2027. Memo: the GAAP-current classification alone is only $1,418M — see the "GAAP-current memo" row in §3 below. |
| Cash interest | $292M | FY2025 actual cash interest paid, used as a proxy for the next 12 months (no raw TTM interest-expense $ figure is separately itemized in this pool) [`earnings/06_earnings-quality.md` §1] — labeled proxy |
| Maintenance capex | $12,923M (TTM total capex, used as a proxy — flagged) | `earnings/01_historical-financials.md` §3. Tesla does not split maintenance vs. growth capex, so total capex is used as the conservative proxy line here. This likely overstates "maintenance-only" spend but likely **understates** true forward total capex: the CFO guided full-year 2026 capex to exceed $25bn (more than double FY2025's $8,527M) and stated capex "will grow for the next two to three years" to fund robotaxi, Optimus, a semiconductor fab, solar manufacturing and AI compute [`earnings/06_earnings-quality.md` §1; Tesla Q2 2026 Earnings Call, Jul-22-2026] |
| Committed dividends / buybacks | $0 | Tesla has paid $0 in dividends and repurchased $0 of shares in any year since at least FY2017 [`business-model/business-model_dossier.md`, capital-allocation row; CIQ Financials_Annual.xls, Cash Flow tab] — no discretionary capital-return commitment to fund |
| **Total near-term uses (gross-obligations basis)** | **$20,521M** | $7,306 + $292 + $12,923 + $0 |

Memo — total near-term uses using the **GAAP-current** ($1,418M) maturity figure instead of the contractual wall: $1,418 + $292 + $12,923 + $0 = **$14,633M**.

---

## 3. Runway

**Basis choice:** MODULE_RULES §8 calls for the **net-of-FCF basis** when FCF is "meaningful/positive" and the **gross-obligations basis** when FCF is "negative or unreliable." TTM FCF ($5,762M, ended Jun-30-2026) is positive on a trailing basis, but it is **flagged as unreliable as a forward run-rate**: quarterly FCF turned negative for the first time in eight quarters in Q2 2026 (−$1,092M), driven by a capex ramp the company has explicitly guided will continue and intensify — full-year 2026 capex is guided to exceed $25bn, more than double FY2025's $8,527M, with growth continuing "for the next two to three years" [`earnings/06_earnings-quality.md` §1; Tesla Q2 2026 Earnings Call, Jul-22-2026]. Given that disclosed, forward-guided step-change, this report leads with the **gross-obligations basis** as the more conservative, decision-relevant read (CLAUDE.md §4 conservative-default rule; MODULE_RULES Core Principle 7), and shows net-of-FCF as a labeled memo.

### Primary — Gross-obligations basis

| Metric | Value |
|---|---:|
| Total usable liquidity | $48,238M |
| Annual FCF | Not subtracted on this basis (deliberately ignoring operating inflows, per MODULE_RULES §8) |
| Basis used | Gross-obligations (FCF flagged unreliable given guided capex step-up) |
| Annual net cash burn = 12-month uses (no FCF subtraction) | $20,521M |
| Monthly net cash burn = $20,521M ÷ 12 | $1,710.1M |
| **Liquidity runway (months) = $48,238M ÷ $1,710.1M** | **≈ 28.2 months** |

Memo, using GAAP-current maturities ($1,418M) instead of the contractual wall ($7,306M): total uses $14,633M → monthly burn $1,219.4M → runway ≈ **39.6 months**.

### Memo — Net-of-FCF basis (TTM FCF, labeled backward-looking, not a forward run-rate)

| Metric | Value |
|---|---:|
| Total usable liquidity | $48,238M |
| Annual FCF (TTM, ended Jun-30-2026) | $5,762M — labeled run-rate, **not** a forecast; flagged unreliable given guided FY2026 capex >$25bn [`earnings/01_historical-financials.md` §2] |
| Basis used | Net-of-FCF (memo only) |
| Annual net cash burn = (12-month contractual maturities $7,306M + $0 dividends/buybacks) − FCF $5,762M | $1,544M |
| Monthly net cash burn = $1,544M ÷ 12 | $128.7M |
| **Liquidity runway (months) = $48,238M ÷ $128.7M** | **≈ 375 months (~31 years)** — functionally unconstrained |

Memo within the memo: against GAAP-current maturities alone ($1,418M), TTM FCF more than covers the 12-month wall — annual net burn is negative (−$4,344M), i.e., an **annual surplus of $4,344M**, not a finite runway, on that combination.

Both readings point the same direction — Tesla's liquidity is not the binding constraint over the next 12 months even under the conservative gross-obligations basis (28.2 months, over 2 years of coverage). The wide spread between the two bases (28 months vs. ~31 years) is entirely a function of whether TTM FCF is trusted to hold given the guided capex ramp — not a data-quality problem in the liquidity figure itself.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital shows real, disclosed seasonality (Q1 is consistently the weakest revenue quarter, 20–24% of annual revenue, with days-sales-outstanding rising 16.7% then 20.4% YoY in FY2024–FY2025 [`earnings/01_historical-financials.md` §5; `earnings/06_earnings-quality.md` §3]), but **no disclosed peak-quarter cash-usage or seasonal working-capital-build figure exists in this pool**. Peak working-capital need not disclosed — runway may be overstated. Separately, the capex ramp itself is a disclosed, quantified "seasonal-like" cash event already captured in the gross-obligations uses line above (the guided FY2026 capex step-up), which is the larger and better-evidenced near-term cash-usage risk relative to ordinary working-capital seasonality.

---

## 4. Sources & Uses Bridge

Internal sources comfortably cover the next 12 months on any reading: usable liquidity of $48,238M is 6.6x the conservative contractual 12-month debt wall ($7,306M) and 2.4x the full gross-obligations bucket ($20,521M) including the guided capex ramp — no external access (refinancing, asset sale, or facility drawdown beyond the RCF already counted) is required to survive the next 12 months. The overwhelming majority of the runway is **already-in-hand liquidity** ($48,238M of cash, unrestricted short-term investments, and the undrawn RCF), not FCF that must materialize: even on the most conservative gross-obligations basis, which assumes zero operating cash inflow is netted against obligations, the runway is still ≈28 months. FCF only extends the runway further (to the multi-decade net-of-FCF memo figure above) if the TTM $5,762M run-rate holds — which is exactly the assumption flagged as unreliable given the guided capex step-up, so it should not be relied on for the headline read.

---

## 5. Liquidity Read

Tesla's liquidity runway is at minimum ≈28 months (2.3 years) on the conservative gross-obligations basis — usable liquidity of $48,238M (cash $15,219M + unrestricted short-term investments $28,019M + the undrawn $5,000M RCF) against $20,521M of annual near-term obligations (the $7,306M contractual 12-month debt wall, cash interest, total capex used as a maintenance-capex proxy, and $0 of dividends/buybacks) — and this floor does not depend on FCF materializing at all. The runway depends almost entirely on liquidity already on the balance sheet, not on cash flow that has to show up; even if FCF collapses to zero as the company ramps capex toward its guided $25bn+ for FY2026, Tesla still has over two years of coverage before external funding would be needed. The single biggest liquidity risk is not a shortfall in dollars but a concentration and reliability issue already flagged upstream: the largest single line inside the 12-month uses figure is the $5,888M China Working Capital Facility, whose GAAP long-term classification rests on an unevidenced "intent and ability to refinance" assertion rather than a committed replacement facility [`02_maturity-wall-and-refinancing.md` §1b, §4] — and separately, TTM FCF ($5,762M) is not a reliable guide to 2026's actual free cash flow given the disclosed, guided capex step-up, so any read that leans on FCF holding (the net-of-FCF memo above) should be treated with caution even though the dollar cushion makes the distinction largely academic here.
