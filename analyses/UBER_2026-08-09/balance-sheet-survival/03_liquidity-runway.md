# Liquidity Runway — UBER

Reporting currency: **USD** (millions unless stated). All figures are as of **June 30, 2026** (Q2 FY26 10-Q, filed Aug-05-2026) unless noted, consistent with `01_capital-structure-and-leverage.md` and `02_maturity-wall-and-refinancing.md`. This agent runs after `02` per the module's Layer-3 dependency and reuses its 12-month maturity figure directly.

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $4,870M | Y | Not restricted | [Q2 FY26 10-Q, Condensed Consolidated Balance Sheets; `01` §3] |
| Liquid short-term investments | $521M | Y | Not restricted | [Q2 FY26 10-Q, Condensed Consolidated Balance Sheets; `01` §3] |
| Revolver / facilities (commitment) | $5,000M | maybe | Credit Agreement commitment; $0 drawn as of Jun-30-2026 | [Q2 FY26 10-Q, Note 5; `01` §1] |
| Revolver availability (known) | $4,676M | Y | Commitment $5,000M less a $324M reduction from $2.3bn of letters of credit outstanding — availability is **disclosed**, so the revolver is not excluded per the module's "availability unknown" rule | [Q2 FY26 10-Q, Note 5; `01` §2] |
| **Total usable liquidity** | **$10,067M** | | Cash $4,870M + ST investments $521M + revolver availability $4,676M | Computed |

**Items explicitly excluded from the headline figure, and why:**
- **2026 Term Loan undrawn commitment ($1,000M)** — of the $3.0bn facility, $2.0bn was drawn and $1.0bn remained available as of Jun-30-2026, but the facility "permits borrowings through August 2, 2026, after which any undrawn commitments expire" [Q2 FY26 10-Q, Note 5]. This report is dated Aug-09-2026 — one week past that deadline — so the $1.0bn is very likely lapsed. *Inference, not from filings*; no post-Aug-2 filing in the pool confirms the lapse, but it is excluded on the conservative default.
- **Commercial paper program** — established, but not a committed facility in its own right (issuance capacity, market-dependent, backstopped by the revolver rather than an independent liquidity source); $0 outstanding, excluded [`01` §1].
- **Restricted cash and cash equivalents** ($661M current + $1,646M non-current = $2,307M) and **restricted investments** ($9,486M non-current) — **flagged as restricted.** These are marketable debt securities and cash held in trust accounts collateralizing $9,528M of long-term insurance reserves for auto/general liability claims; the filing's own words describe them as "unavailable for use in short-term operations due to legal and/or contractual restrictions" [FY25 10-K, Item 8, Restricted Investments note; `01` §3]. Total restricted cash + investments ($11,793M) is **larger than Uber's entire unrestricted cash & short-term investments balance** — excluding it is the single most important liquidity-quality adjustment in this report.
- **Long-term investments ($8,759M, non-current, not officially restricted)** — excluded because Uber's own MD&A liquidity headline ("unrestricted cash, cash equivalents and short-term investments") already excludes it, and it is not a liquid short-term instrument [`01` §3].
- No undrawn-committed-facility disclosure gap exists here (availability is known), so the module's Score Cap Rule for "revolver exists but availability unknown" does **not** apply.

Reporting currency: USD throughout.

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from `02`) | $2,136M — 2026 Term Loan $2,000M (matures Dec-2026) + finance-lease current portion $136M | [`02_maturity-wall-and-refinancing.md` §1] |
| Cash interest | $386M — most recent full-year actual cash interest paid (FY2025); TTM gross interest *expense* (accrual basis) is $462M per `04`, shown as the closest available near-term proxy since a TTM cash-paid figure is not separately disclosed | [earnings/06_earnings-quality.md §1 (FY2025 cash interest paid); `04_coverage-and-covenants.md` §1 (TTM interest expense)] |
| Maintenance capex | $308M — TTM total capex (no maintenance/growth split disclosed; capex is ≤0.7% of revenue in every year, so this omission has limited effect on the read) | [earnings/01_historical-financials.md §2; earnings/06_earnings-quality.md §1] |
| Committed dividends / buybacks | **$0 committed.** Uber pays no dividend. The $20.0bn board-authorized buyback program (July 2025, $15.7bn remaining as of Jun-30-2026, TTM repurchases $6,904M) is **discretionary, not a contractual commitment** — shown as a memo item below, excluded from this total | [`02_maturity-wall-and-refinancing.md` §4; earnings/01_historical-financials.md §2] |
| **Total near-term uses (informational)** | **$2,830M** | Computed: 2,136 + 386 + 308 + 0 |

**Memo — discretionary buyback run-rate (not a committed use):** Uber repurchased $6,904M of common stock on a TTM basis and has $15.7bn of remaining board authorization. This is not contractually due, so it is excluded from "Total near-term uses," but it is a real, recent, and large discretionary claim on the same cash pool — H1 FY2026 net debt rose $4.4bn in six months substantially to fund it [`01` §1, §6]. It is carried forward into Section 4/5 below as a risk to the runway even though it does not enter the formula.

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | $10,067M |
| Annual FCF (TTM, Jul-2025–Jun-2026) | $10,116M (CFO $10,424M − capex $308M) [earnings/01_historical-financials.md §2] |
| Basis used | **Net-of-FCF** — FCF is meaningful: positive and rising every year since FY2022, cash-backed (CFO/EBITDA 160.0% FY2025, 201.8% FY2024; earnings-quality score 71/100), not a proxy [earnings/06_earnings-quality.md §1–2, §9] |
| Annual net cash burn (net-of-FCF basis) | **−$7,980M** (a surplus, not a burn) = (12-month debt maturities $2,136M + committed dividends/buybacks $0) − FCF $10,116M. Cash interest and maintenance capex are **not** re-added — FCF already carries both (§8 of MODULE_RULES) |
| Monthly net cash burn | **−$665M/month** (i.e., a monthly cash build, not a drain), computed as −7,980 ÷ 12 |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **Not applicable — FCF surplus.** TTM FCF alone covers the entire 12-month debt-maturity wall **4.74x** over ($10,116M / $2,136M) before touching a dollar of the $10,067M liquidity pool. There is no finite depletion date on these numbers. |

**Formula and basis named explicitly, per MODULE_RULES §8:** on the net-of-FCF basis, annual burn = (12-month maturities + committed dividends/buybacks) − FCF. Because FCF ($10,116M) exceeds the only contractual near-term obligation ($2,136M of debt maturities; committed dividends/buybacks = $0) by a wide margin, the bracketed figure is negative — a surplus, stated here rather than forcing a small/finite "months" number that would understate the position (per the rule's explicit instruction).

**Conservative cross-check (not the headline number): liquidity alone, assuming FCF were zero.** If Uber generated no free cash flow at all for the next 12 months, the $10,067M of usable liquidity would still cover the full gross near-term uses bucket ($2,830M/year = $235.8M/month) for **≈42.7 months** ($10,067M ÷ $235.8M). This is the gross-obligations-basis calculation shown only as a stress cross-check — the net-of-FCF basis above is the one that applies given FCF is real and meaningful.

### Seasonality / Peak Liquidity Need (Hard Check)

Uber's revenue is mildly seasonal — Q4 is consistently the strongest quarter (26.7–27.6% of annual revenue, rising each of the last three fiscal years) and Q1 the weakest (22.2–23.7%, falling each year) — but no quarter exceeds the 30%/20% flag thresholds [earnings/01_historical-financials.md §5]. More importantly, **working capital has been a net source of cash in every year FY2021–FY2025** ($1,682M, $335M, $165M, $2,374M, $2,227M inflows respectively), not a use — driven by a structurally negative operating cycle (cash conversion cycle of 14.2 days, DSO 25.1 days, DPO 10.9 days, FY2025) plus a growing insurance-reserve float [earnings/06_earnings-quality.md §1, §3]. No dollar-figure "peak seasonal cash build" is disclosed anywhere in the pool. Per the hard-check rule: **peak working-capital need is not disclosed as a specific dollar figure — runway may be nominally overstated on that technicality — but the direction of the evidence (working capital as a recurring net cash source, mild revenue seasonality) points the other way**, so this is a disclosure gap, not an active risk signal.

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months several times over without any external access: TTM FCF ($10,116M) alone is 4.74x the entire 12-month debt-maturity wall ($2,136M), and the $10,067M of already-in-hand usable liquidity (cash + short-term investments + known revolver availability) independently covers 4.7x that same wall — either one alone clears it. Roughly **75% of the runway cushion sits as already-in-hand liquidity** ($10,067M) and the remaining coverage comes from FCF that has been consistently positive and cash-backed for four straight years (earnings-quality score 71/100), so this is not a thesis that depends on a fragile forecast holding up. The real caveat is not near-term maturities but discretionary cash use running in parallel: a $20.0bn buyback program ($15.7bn still authorized, $6,904M repurchased TTM) has already pulled strict net debt up $3.96B (+67%) in the year to Jun-30-2026 [`01` §6; earnings/01_historical-financials.md §2], and the pending €14.2 billion Delivery Hero acquisition bridge facility (executed Jul-16-2026, undrawn, expected close H2 2027) sits entirely outside this 12-month window but is the largest forward claim on the same liquidity pool this report measures [`01` §1, "Headline forward-looking item"].

## 5. Liquidity Read

Uber's liquidity runway is not a finite countdown — TTM free cash flow ($10,116M) covers the entire 12-month debt wall ($2,136M) 4.74x over, and $10,067M of committed, unrestricted liquidity provides a second, independent line of coverage even before any FCF is counted; on a zero-FCF stress cross-check, liquidity alone would fund 12-month gross obligations for roughly 42.7 months. This position depends on nothing fragile — no near-term refinancing, no undisclosed revolver availability, no proxy cash-flow estimate — cash generation is genuinely cash-backed (CFO ran 160–202% of EBITDA in FY2023–FY2025) rather than paper profit. The single biggest liquidity risk is not covered by this 12-month formula at all: the €14.2 billion Delivery Hero bridge facility, roughly the size of Uber's entire current debt stack, sits just outside this window (expected close H2 2027) and lands on a balance sheet that has already drawn cash down $2.2bn in H1 FY2026 to fund an accelerated, discretionary $6,904M-TTM buyback program with $15.7bn still authorized — the runway measured here is real and wide today, but it is being actively spent down by capital-return and M&A decisions that this liquidity-runway formula, by design, does not capture.

Out-of-scope request received: none. This report stays within the liquidity-runway mandate — it does not build the maturity wall (`02`), assess covenants (`04`), or run the stress test (`06`).
