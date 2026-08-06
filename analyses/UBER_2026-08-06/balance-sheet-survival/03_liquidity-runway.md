# Liquidity Runway — UBER

**Reporting currency:** USD (millions unless stated). **Source-pool caveat (carried from `00`–`02`):** no primary SEC filing (10-K/10-Q) is physically present in `data/UBER/`; every figure below is Capital IQ's vendor transcription of Uber's FY2025 10-K (filed 2026-02-13) and Q2 FY2026 results (released 2026-08-05) — cited as "CIQ export," never as "10-K." The Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record and is cited as such. All balance-sheet figures are as of Jun-30-2026 unless stated; the revolver availability figure is the most recent disclosed (Mar-31-2026) and is flagged as stale by ~4 months.

## 1. Liquidity Sources (committed only)

| Source | Amount ($mm) | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | 4,870 | Y | Not restricted | `01_capital-structure-and-leverage.md` §3, CIQ Balance Sheet tab, Jun-30-2026 |
| Liquid short-term investments | 521 | Y | Not restricted | `01_capital-structure-and-leverage.md` §3, CIQ Balance Sheet tab, Jun-30-2026 |
| Revolver / facility (commitment) | 4,668 (undrawn) | maybe | Senior Unsecured Revolving Loans; $0 drawn; matures 2029-09-26. Figure is Mar-31-2026, not re-disclosed at Jun-30-2026 — stale by ~4 months. Not a borrowing-base facility on the evidence available, so availability = commitment, not a reduced borrowing base | `02_maturity-wall-and-refinancing.md` §4, CIQ Capital Structure Summary tab |
| Revolver availability (as disclosed) | 4,668 | Y | Treated as committed by convention (tagged "Revolving Credit," not a demand line, $0 drawn across every period shown) — **flagged: not independently confirmed as "committed" in the pool** (no credit agreement present) | `01_capital-structure-and-leverage.md` §1; `02_maturity-wall-and-refinancing.md` §4 |
| **Total usable liquidity** | **10,059** | | = 4,870 + 521 + 4,668 | Calc. |

**Excluded from the headline figure (per hard rule):**
- **Commercial paper program, $2,000mm undrawn capacity** — excluded. CP issuance depends on market appetite at the time of need, not on a firm commitment; it is not treated as committed, undrawn liquidity even though $0 is currently drawn against the program. [`01_capital-structure-and-leverage.md` §1, CIQ Capital Structure Details/Summary tabs]
- **Restricted cash, $661mm** — excluded and flagged. Not usable for near-term obligations. [`01_capital-structure-and-leverage.md` §3, CIQ Balance Sheet tab, Jun-30-2026, "Restricted Cash" line]
- **Long-term investments, $12,532mm** (incl. $3,773mm of equity-method stakes, including AV-partner and Delivery Hero-adjacent holdings) — excluded as illiquid, not near-cash. [`01_capital-structure-and-leverage.md` §3]

No minimum-liquidity or springing-liquidity covenant is disclosed in the pool, so nothing is subtracted for one [`04_coverage-and-covenants.md` §2]. Reporting currency: USD.

## 2. Near-Term Uses (next 12 months)

| Use | Amount ($mm) | Source |
|---|---:|---|
| Debt maturities (from `02`) | 2,175 | `02_maturity-wall-and-refinancing.md` §1 — "Within 12 months (by ~Jun-2027)": $1,997mm unidentified new short-term debt (H1 FY2026, no instrument detail disclosed) + $178mm current lease obligations, CIQ Balance Sheet tab, Jun-30-2026 |
| Cash interest (LTM gross, used as next-12-month proxy) | 462 | `04_coverage-and-covenants.md` §1, CIQ Income Statement tab, "Interest Expense," LTM Jun-30-2026 |
| Maintenance capex | 308 | CIQ Cash Flow tab, "Capital Expenditure," LTM Jun-30-2026. **Inference, not from filings:** the pool does not split capex between maintenance and growth; total capex (an asset-light business, so the split is likely small) is used as a conservative proxy |
| Committed dividends / buybacks | 0 committed | Uber has never paid a dividend in any period shown, FY2021–LTM ("Total Dividends Paid" = "-") [`earnings/01_historical-financials.md` §1; CIQ Cash Flow tab]. The buyback program (management states "deploying about 50% of our free cash flows towards buybacks" [Q2 FY2026 transcript, p.12]) is **discretionary, not contractual** — evidenced by management itself throttling it by ~$4bn in Q2 FY2026 to fund the Delivery Hero stake purchase [`business-model/11_capital-allocation-governance.md`]. Treated here as $0 committed; see §4 for how a resumed buyback would change the picture |
| **Total near-term uses** | **2,945** | Sum |

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | $10,059mm |
| Annual FCF (LTM, CFO − total capex, CLAUDE.md §15 basis) | $10,116mm (= $10,424mm CFO − $308mm capex) [`02_maturity-wall-and-refinancing.md` §4, CIQ Cash Flow tab, LTM; cross-checked to management: "a little bit over $10 billion in free cash flows over the trailing 12 months," Q2 FY2026 transcript, p.11-12] |
| Basis used | **Net-of-FCF** — FCF is meaningfully positive, growing (+18.5% YoY), and cash-backed: CFO has exceeded Adj. EBITDA for three straight years, reaching 115.7% of Adj. EBITDA in FY2025 [`earnings/06_earnings-quality.md` §9, cited via `04_coverage-and-covenants.md` §1] |
| Annual net cash burn (net-of-FCF basis) | **−$7,941mm** (a surplus, not a burn). Formula: (12-month debt maturities $2,175mm + committed dividends/buybacks $0) − FCF $10,116mm = 2,175 − 10,116 = −7,941. **Cash interest ($462mm) and maintenance capex ($308mm) are NOT re-added** — FCF (CFO − total capex) already carries both, per the module's net-of-FCF formula |
| Monthly net cash burn | **−$662mm/month** (net cash build, not burn): −7,941 / 12 |
| **Liquidity runway (months)** | **Not a finite runway — FCF surplus.** LTM FCF ($10,116mm) exceeds the entire next-12-month obligations bucket ($2,175mm of maturities + $0 committed returns) by $7,941mm/year. Liquidity alone ($10,059mm) also covers 12-month maturities 4.6x over (10,059/2,175) before any FCF is counted |

**Conservative cross-check — liquidity-only runway with FCF assumed at zero (i.e., the gross-obligations basis, run here only as a stress sanity check, not the module-designated basis since FCF is reliable):** monthly burn = full 12-month uses ÷ 12 = $2,945mm / 12 = $245mm/month. On that basis, $10,059mm of committed liquidity alone — with **no** operating cash inflow credited at all — funds **~41 months (~3.4 years)** of debt service, interest, capex, and returns. This is the floor case; it is not the headline figure because FCF is real, cash-backed, and not a fragile assumption (§3 read below), but it shows the in-hand-liquidity cushion is deep even without FCF.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital is **mildly seasonal, not sharply so**: Q1 is consistently the softest revenue quarter (~23% of annual revenue vs. a ~25% even split) and Q4 the strongest (~27–28%) in every one of the last three fiscal years (FY2023–FY2025), with Adj. EBITDA margin following the same pattern (lowest in Q1, highest in Q4) [`earnings/01_historical-financials.md` §5]. Working capital itself (current assets − current liabilities) has moved from −$205mm (FY2021) to +$1,673mm (FY2025) and is described as "volatile" year to year [`earnings/01_historical-financials.md` §1], but no dollar figure for a peak-quarter cash-usage build (e.g., a driver/courier-incentive or insurance-reserve seasonal swing) is disclosed anywhere in the pool. **Peak working-capital need not disclosed — runway may be overstated.** Given the mild historical seasonality band (Q1 revenue share ~22–24% vs. a flat 25%), the plausible seasonal swing is small relative to the ~$8bn annual FCF surplus computed above, but it is not quantified and is not netted into any figure in this report.

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months many times over without any external access: $10,059mm of already-in-hand committed liquidity (cash, liquid investments, and undrawn committed revolver — none of it dependent on market conditions) alone covers the $2,945mm of total near-term uses (maturities + interest + capex) 3.4x, before a dollar of FCF is credited. Layering in LTM FCF ($10,116mm, cash-backed per `earnings/06`) turns the 12-month picture into a projected $7,941mm net cash build, not a drawdown. **Roughly 78% of the total coverage cushion is already-in-hand liquidity ($10,059mm of the combined $10,059mm liquidity + $7,941mm FCF-surplus-above-obligations ≈ $18.0bn total buffer), and the remaining ~22% depends on FCF continuing at its current run rate** — a lower bar than most companies face, since even the fully conservative zero-FCF stress case (§3) still shows ~41 months of coverage from liquidity alone. The one live call on this cushion not reflected above: if Uber resumes its ~50%-of-FCF buyback policy at its recent run rate (~$6.5–6.9bn/year, per `business-model/11_capital-allocation-governance.md`) rather than continuing to throttle it for M&A, roughly two-thirds of the annual FCF surplus would be redirected to discretionary shareholder returns — still leaving a comfortable surplus over the disclosed $2,175mm 12-month maturity wall, but materially thinner than the headline $7,941mm figure if both buybacks and further M&A cash calls (see §5) draw on the same pool simultaneously.

## 5. Liquidity Read

Uber does not have a finite liquidity runway in any meaningful sense — it has an annual FCF surplus of roughly $7,941mm over its disclosed 12-month obligations, on top of $10,059mm of already-in-hand committed liquidity that alone would fund ~41 months of debt service, interest, capex, and returns even crediting zero operating cash flow. The runway depends almost entirely on cash already in hand rather than on FCF materializing — FCF is a bonus buffer, not a load-bearing assumption, and it is cash-backed (CFO has exceeded Adj. EBITDA every year since FY2023). The single biggest liquidity risk this report can identify is **not captured in any figure above**: the pending ~€14 billion Delivery Hero acquisition bridge facility (signed 2026-07-16, committed but undrawn, offer expected H2 2027) is roughly 1.6x the size of Uber's entire current $10,059mm liquidity pool and is not reflected in this runway at all — once drawn, it would need to be modeled as a separate, much larger liquidity event, which is `06_downside-stress-test`'s job, not this agent's [`01_capital-structure-and-leverage.md` §1; `02_maturity-wall-and-refinancing.md` §4-5]. A secondary, smaller risk is the $1,997mm of unidentified new short-term debt on the balance sheet at Jun-30-2026, whose true cash-maturity terms are not disclosed in this pool [`02_maturity-wall-and-refinancing.md` §1] — it is included in the 12-month uses bucket above at face value, conservatively.
