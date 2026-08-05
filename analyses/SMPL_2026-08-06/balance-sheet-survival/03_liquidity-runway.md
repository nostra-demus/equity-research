# Liquidity Runway — SMPL

**Reporting currency:** US dollars (USD). **Fiscal year:** ends the last Saturday in August (FY2025 ended Aug 30, 2025). Figures below are as of the most recent balance-sheet date, **May 30, 2026** (Q3 FY2026 10-Q, filed Jul-09-2026), consistent with `01_capital-structure-and-leverage.md` and `02_maturity-wall-and-refinancing.md`. Today's date is 2026-08-06.

---

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $123.9M | Y | No restricted-cash line item is disclosed anywhere in the balance sheet or notes; treated as fully unrestricted. | [Q3 FY2026 10-Q, Consolidated Balance Sheets; `01_capital-structure-and-leverage.md` §3] |
| Liquid short-term investments | $0.0M | N/A | None disclosed — the balance sheet carries a single "Cash" line; no separate short-term-investments balance exists. | [`01_capital-structure-and-leverage.md` §3] |
| Revolver / facilities (commitment) | $75.0M | maybe | Not counted at face value — see availability row below. | [Q3 FY2026 10-Q, Note 5] |
| Revolver availability (disclosed) | $73.9M ($75.0M − $1.1M letters of credit outstanding) | Y | Not a borrowing-base facility, so full commitment less LCs is the correct availability figure; $0.0M drawn as cash as of May 30, 2026. | [Q3 FY2026 10-Q, Note 5; `02_maturity-wall-and-refinancing.md` §4] |
| **Total usable liquidity** | **$197.8M** ($123.9M + $0.0M + $73.9M) | | | Sum of the above |

There are no uncommitted lines disclosed to exclude — the entire $75.0M facility sits under the single Credit Agreement and is fully committed. Reporting currency: USD. Liquidity above is stated on the strict, committed-only basis required by this module: cash + $0 liquid investments + confirmed revolver availability (not the $75.0M headline commitment).

---

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from 02) | $0.0M | [`02_maturity-wall-and-refinancing.md` §1: "not required to make principal payments on the Term Facility over the twelve months following... May 30, 2026"] |
| Cash interest | ~$20.0M (TTM accrual basis, derived) — flag: this reflects a period when the average outstanding balance was below the current $400.0M (the $150.0M upsize only closed Nov-19-2025); a forward run-rate at the full $400.0M balance and the current 5.7% effective rate would be ~$22.8M/year | [`04_coverage-and-covenants.md` §1: TTM interest expense $20.0M, derived from filed quarterly deltas] |
| Maintenance capex | Not separately disclosed — total capex (TTM) $28.1M used as the best available proxy; `earnings/06_earnings-quality.md` flags that no maintenance-vs-growth split is given in any filing in the pool. | [`earnings/01_historical-financials.md` §2; `earnings/06_earnings-quality.md` §2/§Sustainability table] |
| Committed dividends / buybacks | $0.0M | SMPL pays no dividend (none disclosed or declared in any filing in the pool). The stock-repurchase program is explicitly **discretionary**: "does not obligate the Company to acquire any specific number of shares... may be suspended or discontinued at any time" [Q3 FY2026 10-Q, "Stock Repurchase Program"]. $157.5M remains available under the authorization as of May 30, 2026, but none of it is a committed obligation — excluded from this line on that basis (flagged separately below given its recent size and pace). |
| **Total near-term uses (gross, informational only — not the runway input)** | **$48.1M** ($0.0M + $20.0M + $28.1M + $0.0M) | Sum of the above. Not used directly in the Section 3 runway formula because cash interest and capex are already inside FCF (see Section 3). |

---

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | $197.8M |
| Annual FCF (TTM) | $119.4M (CFO $147.5M − total capex $28.1M; down 32.0% YoY from $175.6M prior TTM) [`earnings/01_historical-financials.md` §2] |
| Basis used (net-of-FCF / gross-obligations) | **Net-of-FCF** — FCF is positive and directly filing-derived (not a proxy), so it is "meaningful" per the module rule |
| Annual net cash burn (on the stated basis) | (12-month debt maturities $0.0M + committed dividends/buybacks $0.0M) − FCF $119.4M = **−$119.4M** (a surplus, not a burn) |
| Monthly net cash burn (annual burn ÷ 12) | Not applicable — there is no burn; the equivalent monthly surplus is ≈$9.95M/month |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **No finite runway applies.** Near-term committed obligations are $0.0M, so there is nothing for the $197.8M of liquidity or the $119.4M of FCF to be measured against. State as an annual surplus: **$119.4M of TTM FCF, entirely unencumbered by any committed 12-month obligation.** |

**Formula shown, basis named:** on the net-of-FCF basis, annual net burn = (12-month maturities + committed dividends/buybacks) − FCF = ($0.0M + $0.0M) − $119.4M = −$119.4M. Cash interest (~$20.0M TTM) and capex ($28.1M TTM) are **not** re-added — FCF already nets both out (§15, MODULE_RULES §8). Even under the more conservative gross-obligations basis (ignoring FCF entirely and summing all $48.1M of interest + capex + maturities from Section 2), the same $119.4M of FCF alone covers it 2.48x over ($119.4M / $48.1M), leaving a further $71.3M of annual surplus after paying every disclosed near-term cash use in full — so the "no finite runway" conclusion does not depend on which basis is used, only its size does.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital is **mildly** seasonal, not materially so: no fiscal quarter took more than 30% or less than 20% of annual revenue in any of FY2023–FY2025; Q1 (Sept–Nov) is consistently the smallest quarter (~23–24% of annual revenue) and Q3/Q4 (Mar–Aug) are consistently the largest (~25–28%) [`earnings/01_historical-financials.md` §5]. Net working capital has also been stable across FY2021–FY2025 ($185.0M → $249.4M → $281.8M → $331.7M → $329.1M), with no sharp seasonal trough visible in the annual data [`earnings/01_historical-financials.md` §1]. A discrete peak-quarter cash-usage or working-capital-build dollar figure is not disclosed anywhere in the pool. **Peak working-capital need not disclosed — runway may be overstated**, though given the mild amplitude of the revenue seasonality shown (a 20–30% band, no outlier quarter) and the stable multi-year net-working-capital trend, the likely size of any understated seasonal draw is small relative to the $197.8M of liquidity and $119.4M of FCF surplus computed above — it would need to be an order of magnitude larger than anything in the disclosed history to turn this into a finite-runway situation.

---

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months without qualification and without needing FCF to materialize at all: committed near-term obligations are $0.0M (no debt maturities before March 2030, no dividend, no committed buyback), against $197.8M of already-in-hand committed liquidity (cash $123.9M + confirmed revolver availability $73.9M). None of the 12-month runway depends on FCF holding up — the entire obligation set is already covered by liquidity sitting on the balance sheet today, and the $119.4M of TTM FCF is pure additional cushion, not a load-bearing input. The one real drain on this position is discretionary, not committed: in the 39 weeks ended May 30, 2026, the Company spent $213.2M on share buybacks against just $92.1M of FCF over the same window (CFO $102.2M − capex $10.1M) [Q3 FY2026 10-Q, MD&A "Liquidity and Capital Resources"; `01_capital-structure-and-leverage.md` §6], funding the $121.1M gap partly from a fresh $150.0M term-loan draw — a policy choice management can halt at any time (the program "does not obligate the Company to acquire any specific number of shares"), not a liquidity requirement, but it is the mechanism by which net leverage rose from 0.54x to 1.18x Adjusted EBITDA in the past year.

---

## 5. Liquidity Read

SMPL has no finite liquidity-runway problem over the next 12 months: committed near-term obligations total $0.0M against $197.8M of committed, already-in-hand liquidity (cash $123.9M + confirmed revolver availability $73.9M) and TTM free cash flow of $119.4M that sits entirely as surplus on top — no refinancing, asset sale, or FCF materializing is required, because there is nothing due (`02_maturity-wall-and-refinancing.md`). The single biggest liquidity risk here is not obligations but behavior: the Company has been spending faster than it earns through discretionary share buybacks ($213.2M in the 39 weeks ended May 30, 2026 versus $92.1M of FCF over the same period), funded partly by a $150.0M debt draw, while Adjusted EBITDA margin sits at a multi-year trough (16.9% TTM) and FCF itself is down 32.0% YoY — a trend that, if it continues at the current pace, would erode the liquidity cushion this report currently finds ample, even though nothing in the buyback program is a committed obligation today.

