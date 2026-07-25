# Coverage & Covenants — TSLA

**Basis carried from `01_capital-structure-and-leverage.md`:** reporting currency USD, US GAAP, figures in millions. Debt and EBITDA base: canonical net debt $861M (broad/lease-inclusive gross debt of $16,080M minus cash & equivalents of $15,219M, strict §15 cash basis) [`01_capital-structure-and-leverage.md`, §7]; TTM period ended Jun-30-2026 throughout this report unless stated otherwise.

---

## 1. Coverage Ratios

TTM figures = Q3 2025 + Q4 2025 + Q1 2026 + Q2 2026 (period ended Jun-30-2026), matching `earnings/01_historical-financials.md` §2. All ratios computed with a Python snippet (shown in the agent's working, reproducible from the inputs cited below).

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest (gross) | **32.48x** ($10,849M / $334M) | EBITDA: [`earnings/01_historical-financials.md`, §2 TTM Snapshot]. Interest expense: [Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls, Income Statement tab, "Interest Expense" row, Q3'25 $76M + Q4'25 $85M + Q1'26 $92M + Q2'26 $81M = $334M] |
| EBIT / interest (gross) | **13.09x** ($4,372M / $334M) | EBIT: [`earnings/01_historical-financials.md`, §2 TTM Snapshot]. Interest expense as above |
| (EBITDA − capex) / interest | **−6.21x** (($10,849M − $12,923M) / $334M = −$2,074M / $334M) | Capex TTM: [`earnings/01_historical-financials.md`, §2]. Interest expense as above |
| Adjusted EBITDA / interest (memo, non-GAAP) | **45.87x** ($15,322M / $334M) | Adjusted EBITDA TTM: [`01_capital-structure-and-leverage.md`, §5] |
| Fixed-charge coverage (proxy) | **−0.75x** (($10,849M − $12,923M) / ($334M interest + $1,418M current debt+finance-lease maturities + $1,022M current operating-lease liability) = −$2,074M / $2,774M) | Current debt+finance-lease and current operating-lease figures: [`01_capital-structure-and-leverage.md`, §1 and §2, Jun-30-2026 balance-sheet columns]. **Proxy flag:** no discrete "cash paid for operating leases" or scheduled-amortization schedule was found in the 10-Q text search of this pool; the current-portion balance-sheet lines are used as a one-year proxy for near-term lease cash payments and scheduled debt amortization — a labeled proxy, not a disclosed fixed-charge figure |
| Cross-check: CIQ's own EBITDA/interest, LTM Jun-30-2026 | 37.89x | [Tesla Inc NasdaqGS TSLA Credit Health Panel.xls, Financials tab, "EBITDA/Interest Exp. (x)" row, Company column, 2026-06-30 period] — differs from the 32.48x computed above because CIQ's own LTM EBITDA build (Credit Health Panel methodology) is not identical to the company-reported GAAP EBITDA build (Operating Income + D&A) used in this report; both are shown rather than reconciled to a single figure, per CLAUDE.md §5 (cite the source the number actually came from) |

**EBITDA basis:** reported GAAP EBITDA (Operating Income + D&A), TTM $10,849M — the primary basis for all ratios above, per module convention. Adjusted (non-GAAP) EBITDA of $15,322M (excludes SBC, digital-asset gains/losses, the SpaceX equity-investment unrealized gain) is shown as a memo line only, never as the headline. **Interest is gross**, not net: Tesla's income statement separately discloses "Interest Expense" ($334M TTM) and "Interest and Invest. Income" ($1,744M TTM), netting to a **positive** $1,410M of net interest income, not expense [Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls, Income Statement tab]. This is a materially different picture from a normal leveraged borrower: Tesla earns roughly 5x its own gross interest expense from interest income on its cash and short-term-investment pile alone, before any operating EBITDA is counted. Coverage ratios use gross interest per MODULE_RULES.md Calculation Standard #5, but the net-interest-income position is a relevant qualitative fact for the read in §4.

**Cash-backing of EBITDA:** `earnings/06_earnings-quality.md` finds CFO exceeded 85% of GAAP EBITDA in every year FY2021–FY2025 (reaching ~140% in FY2025, itself flagged as partly a shrinking-EBITDA-denominator effect rather than pure quality improvement) [`earnings/06_earnings-quality.md`, §2]. There is no evidence in that module of manufactured or non-cash EBITDA — the $10,849M TTM GAAP EBITDA used above is broadly cash-backed. The one caveat that matters for the ratios above is not an EBITDA-quality issue but a **capex-timing** one: quarterly capex jumped to $5,789M in Q2 2026 (+142% QoQ) as management guided full-year 2026 capex above $25 billion (more than double FY2025's $8,527M) to fund robotaxi, Optimus, a semiconductor fab and AI-compute buildout [`earnings/06_earnings-quality.md`, §1; Tesla Q2 2026 Earnings Call, Jul-22-2026, prepared remarks]. That ramp is what drives the negative (EBITDA − capex)/interest and fixed-charge-coverage readings above — it is a disclosed, funded growth-investment choice (against $43.5B of cash plus short-term investments — see `01_capital-structure-and-leverage.md` §3), not an earnings shortfall.

---

## 2. Covenant Inventory

No quantified covenant threshold, ratio, or covenant-EBITDA definition is disclosed anywhere in this pool. The only disclosure is a binary compliance affirmation: *"As of June 30, 2026, we were in material compliance with all financial debt covenants"* [Q2 FY26 10-Q, Note 8 (Debt)]. Per the module's partial-data rule, a typical market covenant for this credit type is applied as a **LABELED ASSUMPTION** (not a disclosed fact), and numeric headroom against it is indicative only.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage (**LABELED ASSUMPTION** — no disclosed threshold; using a typical investment-grade-adjacent industrial borrower range of 3.5x–4.5x, midpoint 4.0x, per MODULE_RULES.md partial-data rule) | 4.0x net debt / EBITDA (assumed) | 0.08x (net debt $861M / GAAP EBITDA $10,849M, canonical basis) | **+98.0%** [(4.0 − 0.08) / 4.0] (indicative only) | Threshold: labeled assumption, not from filings. Actual: [`01_capital-structure-and-leverage.md`, §5] |
| Min interest coverage (**LABELED ASSUMPTION** — no disclosed threshold; using a typical range of 2.0x–3.0x, midpoint 2.5x) | 2.5x EBITDA/interest (assumed) | 32.48x | **+1,199%** [(32.48 − 2.5) / 2.5] (indicative only — the extreme % is a direct product of Tesla's near-zero gross interest expense, not a data error; see §4) | Threshold: labeled assumption. Actual: §1 above |
| Min liquidity / net worth | Not disclosed | Cash & equivalents $15,219M + ST investments $28,305M = $43,524M combined; stockholders' equity $86,858M | Not assessable — no disclosed floor | [`01_capital-structure-and-leverage.md`, §3, §5] |
| Springing covenant trigger (e.g., revolver utilization threshold) | Not disclosed | RCF Credit Agreement: $0 drawn / $5,000M committed as of Jun-30-2026 — 0% utilized | Not assessable — no springing-covenant language found in the 10-Q text search of this pool; if one exists it is currently "not active" given 0% utilization, but this is inferred from the undrawn balance, not confirmed from a disclosed trigger clause | [`01_capital-structure-and-leverage.md`, §1]; Inference, not from filings, on the "not active" read |
| Equity cure rights (Y/N, limits) | Not disclosed | N/A | Not assessable | "Not disclosed in the data pool" |
| Other — cross-default / change-of-control | Not disclosed | N/A | Not assessable | "Not disclosed in the data pool" [consistent with `00_solvency-data-triage.md`, §3] |

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Undisclosed.** No credit-agreement excerpt, indenture, or debt note in this pool defines a covenant-specific EBITDA (addbacks, exclusions) | "Not disclosed in the data pool" |
| Addbacks permitted (types) | Unknown | — |
| Addback caps / limits | Unknown | — |
| Is covenant EBITDA materially above reported EBITDA? | **Cannot be determined.** The company's own non-GAAP "Adjusted EBITDA" ($15,322M TTM, +41% above the $10,849M GAAP figure) shows the *direction and scale* of what a lenient addback-heavy definition could look like, but there is no evidence this — or any other — definition is what a lender actually uses for covenant purposes | [`01_capital-structure-and-leverage.md`, §5] for the Adjusted EBITDA figure; inference that it may resemble a covenant definition is flagged as "Inference, not from filings" |

**Headroom quality is unknown** — the "addback illusion" risk (a covenant that looks comfortable only because covenant EBITDA is defined generously) cannot be ruled out or confirmed from this pool. This is immaterial in practice here only because Tesla's funded debt is so small relative to any plausible EBITDA base (see §3) — not because the definition question has been resolved.

---

## 3. Headroom & Breach Proximity

**Numeric covenant headroom is "Not assessable" for scoring purposes**, per the module's partial-data rule (no disclosed covenant threshold). The figures below are indicative distances against the two LABELED ASSUMPTION covenants in §2, computed with the same Python snippet as §1.

| Metric | Value |
|---|---:|
| Tightest covenant (of the two labeled-assumption covenants; in relative-percentage terms) | Max net leverage (assumed 4.0x) — indicative headroom +98.0%, versus +1,199% on the assumed min-coverage covenant |
| Headroom on tightest covenant (%) | **+98.0%** (indicative; not a disclosed fact) |
| EBITDA decline that would breach the assumed leverage covenant (4.0x, holding debt fixed) | EBITDA would have to fall to ~$215M — a ~98% decline from TTM GAAP EBITDA ($10,849M) — before net debt/EBITDA reaches 4.0x on the current $861M of net debt. This is not a realistic near-term risk; it is a mechanical result of net debt being tiny |
| Debt increase that would breach the assumed leverage covenant (4.0x, holding EBITDA fixed) | Net debt would have to rise to ~$43,396M — an increase of ~$42.5 billion from the current $861M — to hit 4.0x at the current $10,849M TTM EBITDA |
| EBITDA decline that would breach the assumed min-coverage covenant (2.5x, holding interest fixed) | EBITDA would have to fall to ~$835M — a ~92% decline from TTM — before EBITDA/interest reaches 2.5x on the current $334M of TTM interest expense |

**Read:** on either labeled-assumption covenant, the distance to breach is extreme — not because Tesla's underlying operating performance is exceptional (EBIT margin has fallen from 16.8% in FY2022 to 4.6% in FY2025, per `earnings/01_historical-financials.md` §1), but because the debt base against which any leverage or coverage ratio is measured is almost nonexistent ($861M net debt, $334M TTM gross interest, against $10,849M TTM EBITDA). A genuine near-term fixed-charge concern exists — the negative (EBITDA − capex)/interest and fixed-charge-coverage readings in §1 — but it is a **capex-timing** story (a disclosed, cash-funded growth-capex ramp), not a covenant-breach story. No disclosed covenant is close to breaking on the evidence available; whether an undisclosed lender-negotiated covenant with a stricter or more idiosyncratic definition exists cannot be ruled out (see the addback-illusion flag above), but there is no evidence of one in this pool beyond the binary "in material compliance" statement.

---

## 4. Coverage / Covenant Read

Earnings cover interest with vast room on a pure interest basis: GAAP EBITDA is 32.48x TTM gross interest expense ($10,849M / $334M), and Tesla's interest income ($1,744M TTM) actually exceeds its interest expense, so the company runs net interest income of $1,410M rather than a net interest cost [Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls, Income Statement tab]. But that headline ratio is doing very little work here — Tesla's funded debt is so small (canonical net debt of just $861M against $10,849M TTM EBITDA, 0.08x) that almost any coverage or leverage ratio clears almost any plausible covenant by a wide margin; this is a company with essentially no meaningful covenant exposure to speak of, not a company that has proven itself against a real constraint. No covenant threshold, ratio, or covenant-EBITDA definition is disclosed anywhere in the pool (only a binary "in material compliance" statement, [Q2 FY26 10-Q, Note 8]) — the labeled-assumption headroom of +98.0% on an indicative 4.0x max-leverage covenant is not a real distance-to-breach figure and must be read as illustrative, not disclosed. The one genuine coverage weak spot is (EBITDA − capex)/interest, which is negative at −6.21x TTM because guided 2026 capex above $25 billion (more than double FY2025's $8,527M, funding robotaxi/Optimus/semiconductor-fab/AI-compute buildout) has outrun TTM EBITDA generation — a disclosed, cash-funded growth-investment choice against $43.5 billion of cash and short-term investments, not a signal of financial distress, but it does mean the "coverage after reinvestment" line, not the raw interest-coverage line, is the number to watch if the capex ramp does not translate into EBITDA growth on the timeline management has guided.
