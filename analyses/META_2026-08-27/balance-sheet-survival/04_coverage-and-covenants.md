# Coverage & Covenants — META

Reporting currency: USD, in millions unless stated otherwise. Reporting standard: US GAAP. Fiscal year end: December 31. TTM = four quarters ended Jun-30-2026 (Q3 FY25–Q2 FY26), matching `01_capital-structure-and-leverage.md`'s canonical basis. All ratio arithmetic below was executed with Python (shown inline), not done by hand.

## 1. Coverage Ratios

**EBITDA basis:** reported/calculated — Operating Income + D&A (Meta discloses no adjusted or GAAP EBITDA line item) [`01_capital-structure-and-leverage.md` §5; `earnings/01_historical-financials.md` §1–2]. TTM EBITDA = $112,056m; TTM EBIT (Operating Income) = $89,327m; TTM capex (PP&E purchases) = $89,325m [`earnings/01_historical-financials.md` §2].

**Interest basis:** the company's consolidated income statement "Interest expense" line — GROSS in the sense this module cares about (it is **not** netted against Interest income, which sits on a separate line: $2,123m FY2025, $859m Q2'26 alone). It **is** stated by Meta as "net of capitalized interest" — i.e., interest capitalized onto data-center construction-in-progress is excluded from the expensed figure, so the true gross interest cost incurred (before capitalization) is somewhat higher than the P&L line used here; the capitalized amount is not separately quantified in the data pool, so this is flagged, not corrected for [Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19: "We are not subject to any financial covenants under the Notes. Interest expense, net of capitalized interest, recognized on the Notes was $754 million and $1.29 billion for the three and six months ended June 30, 2026..."; FY2025 10-K, Item 7 MD&A, "Interest and other income (expense), net" table].

TTM interest expense is built from the disclosed quarterly/annual income-statement "Interest expense" line (total interest expense, including the small finance-lease component, not just the Notes): FY2025 annual $1,165m − H1 FY2025 $481m + H1 FY2026 $1,345m = **$2,029m** [FY2025 10-K, Item 7 MD&A "Interest and other income (expense), net" table, p.75 (FY2025 $1,165m / FY2024 $715m / FY2023 $446m); Q2 FY26 10-Q, MD&A "Interest and other income (expense), net" table (H1 FY26 $1,345m / H1 FY25 $481m; Q2 FY26 alone $783m / Q2 FY25 alone $241m)].

```
ebitda_ttm = 112056; ebit_ttm = 89327; capex_ttm = 89325
interest_ttm = 1165 - 481 + 1345               # = 2029
EBITDA/interest        = 112056/2029  = 55.23x
EBIT/interest           = 89327/2029  = 44.03x
(EBITDA-capex)/interest = 22731/2029  = 11.20x
lease_fy25 = 2798  # operating lease cost, FY2025 annual (proxy — no TTM lease-cost figure disclosed)
FCC = (EBITDA-capex)/(interest_ttm + 0 scheduled amort. + lease_fy25) = 22731/4827 = 4.71x
```

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | **55.2x** (TTM) | Calculated: $112,056m / $2,029m |
| EBIT / interest | **44.0x** (TTM) | Calculated: $89,327m / $2,029m |
| (EBITDA − capex) / interest | **11.2x** (TTM) | Calculated: ($112,056m − $89,325m) / $2,029m |
| Fixed-charge coverage | **4.7x** (TTM interest; FY2025-annual lease cost as proxy — flagged, see below) | Calculated: ($112,056m − $89,325m) / ($2,029m + $0 scheduled near-term debt amortization + $2,798m FY2025 operating lease cost) |

**Fixed-charge coverage caveat:** scheduled debt amortization is $0 for the "remainder of 2026" (Meta's bonds carry no near-term maturities — see `01_capital-structure-and-leverage.md` §1) and the next maturity is $2,750m due sometime in calendar 2027, so the true next-12-month figure could be modestly higher than $0 depending on exact 2027 timing (owned in detail by `02_maturity-wall-and-refinancing`). Lease-payment cash cost uses FY2025's annual operating lease cost ($2,798m) as the best available proxy — a TTM-exact lease-cash figure is not separately disclosed in the pool, so this ratio mixes a TTM numerator with an FY2025 lease-cost denominator component; labelled here per §15 hygiene rather than presented as a clean matched-basis ratio.

**Is EBITDA cash-backed?** Yes, and materially more than backed. `earnings/06_earnings-quality.md` §2 shows CFO/EBITDA running 105%–124% every year FY2021–FY2025 (113.6% in FY2025) — cash generated exceeds booked EBITDA every year, the opposite of an "addback illusion" concern. `earnings/06` also flags (§8, severity 60/100) that a January-2025 useful-life extension on servers/network assets cut FY2025 depreciation by $2.92bn, boosting EBIT (not EBITDA — the depreciation change nets out of the EBITDA calculation, since EBITDA adds D&A back) by roughly that amount; this affects the EBIT/interest ratio's comparability to prior years but not the EBITDA/interest ratio.

**Trend — coverage is compressing fast even though the level remains very high.** EBITDA/interest fell from 129.9x (FY2023: $57,929m/$446m) to 118.6x (FY2024: $84,820m/$715m) to 87.5x (FY2025: $101,892m/$1,165m) to 55.2x (TTM). Interest expense has nearly quintupled in under three years (FY2023 $446m → TTM $2,029m) as Meta issued five bond series since Aug-2022 ($84,000m face value cumulative, most recently $30,000m Nov-2025 and $25,000m May-2026) [`01_capital-structure-and-leverage.md` §1, §6], while EBITDA over the same window grew far more slowly (FY2023→TTM: +93%). Only a partial run-rate of the May-2026 $25,000m issuance sits inside the TTM window (roughly two months), so the next 1–2 quarters of reported interest expense are very likely to step up further from the $783m already recognized in the single quarter Q2'26 — an annualized run-rate of that single quarter alone (~$3,132m) would already push EBITDA/interest down to roughly 35.8x on trailing EBITDA, still very strong but a further real compression to flag forward, not a projection this agent is making a forecast call on.

## 2. Covenant Inventory

**No maintenance financial covenants exist — this is an explicit, affirmative disclosure, not a data gap.** Meta's debt note states directly: "We are not subject to any financial covenants under the Notes" [Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19; FY2025 10-K, Note 10 (Long-term Debt), same language]. This is typical of large-cap, investment-grade senior unsecured bond issuance (a "covenant-lite" structure by market convention for issuers at this rating tier), distinct from a leveraged-loan or high-yield credit agreement that would carry maintenance leverage/coverage tests. Meta also has no revolving credit facility, commercial paper program, or committed line of credit disclosed anywhere in the 10-K or 10-Q [`01_capital-structure-and-leverage.md` §1] — so there is no borrowing-base or utilization-triggered springing covenant either, because there is no revolver to spring from.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | **None — no financial covenants under the Notes** | Net debt/EBITDA (strict, TTM) = 0.61x | N/A — no threshold exists to measure against | Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19 |
| Min interest coverage | **None disclosed** | EBITDA/interest (TTM) = 55.2x | N/A | Same |
| Min liquidity / net worth | **None disclosed** | Cash + marketable securities = $90,260m [`01_capital-structure-and-leverage.md` §3] | N/A | Same |
| Springing covenant trigger (e.g., revolver utilization threshold) | **N/A — no revolver or credit facility exists** | N/A | N/A | `01_capital-structure-and-leverage.md` §1: "no revolving credit facility, commercial paper program, or committed line of credit is disclosed anywhere in the 10-K or 10-Q" |
| Equity cure rights (Y/N, limits) | **N — no covenant package to cure** | N/A | N/A | Same |
| Cross-default / change-of-control put / rating-linked pricing step | **Not disclosed in the data pool** | N/A | N/A | `00_solvency-data-triage.md` §"Structural Priority" line item; the only "change of control" language found in the 10-K/10-Q is a general anti-takeover risk-factor discussion (staggered board, dual-class structure), unrelated to the Notes' terms — confirmed by direct text search, not a bond covenant or put right |

**Illustrative benchmark (labeled assumption, per the partial-data rule — shown for context only, not a real covenant).** Because the effect on the reader is the same as "no covenant to test" whether the cause is non-disclosure or a genuine absence of covenants, a typical market maintenance-covenant package for a comparable (though far more leveraged) corporate credit is shown alongside for scale, explicitly labeled as **Inference, not from filings** and **not applicable to META's actual capital structure**:

| Illustrative typical covenant (labeled assumption) | Typical threshold | META's actual metric | Illustrative headroom (not a real covenant test) |
|---|---:|---:|---:|
| Max net leverage (typical leveraged-loan/HY package) | 4.0x–4.5x | 0.61x net debt/EBITDA (strict, TTM) | +85% to +86% vs. the illustrative ceiling (calc: (4.25−0.61)/4.25 ≈ 86%) — but this is not a threshold META is actually bound by |
| Min interest coverage (typical) | 2.0x–3.0x | 55.2x EBITDA/interest (TTM) | +1,760% to +2,660% vs. the illustrative floor — again, illustrative only |

### Covenant EBITDA Definition & Quality (required if headroom is computed)

Not applicable — no covenant, so no covenant-specific EBITDA definition or addback regime exists to evaluate.

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | N/A — no financial covenants exist under the Notes | Q2 FY26 10-Q, Note 8 |
| Addbacks permitted (types) | N/A | — |
| Addback caps / limits | N/A | — |
| Is covenant EBITDA materially above reported EBITDA? | N/A — there is no separate "covenant EBITDA" concept for META; the only EBITDA figure in use anywhere in this module is the reported/calculated $112,056m TTM figure, which per `earnings/06_earnings-quality.md` §2 is itself materially *below*, not above, cash-generated CFO (113.6% CFO/EBITDA in FY2025) | `01_capital-structure-and-leverage.md` §5; `earnings/06_earnings-quality.md` §2 |

**Headroom quality:** not applicable — there is no "addback illusion" risk here because there is no covenant, and separately no adjusted-EBITDA addback bucket of any kind exists in Meta's non-GAAP disclosure (`earnings/06_earnings-quality.md` §4: "Meta does not disclose an adjusted EBITDA, adjusted EBIT, or adjusted net income measure of any kind").

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | **None exists** — Meta's public bonds carry no maintenance financial covenants and there is no revolver/credit facility to spring a covenant from [Q2 FY26 10-Q, Note 8] |
| Headroom on tightest covenant (%) | **Not assessable** — no covenant threshold exists to measure a headroom against (this is the correct classification per the partial-data rule, even though the underlying reason — an explicit "no covenants" disclosure — is a more favorable fact pattern than a genuine non-disclosure) |
| EBITDA decline that would breach it (approx.) | N/A — no covenant to breach. Illustrative only (not a covenant test): EBITDA would need to fall ~94.6% from the TTM level before EBITDA/interest coverage alone would fall to a typical leveraged-credit floor of 3.0x (calc: 1 − (3.0 × $2,029m)/$112,056m = 94.6%) — an extreme, illustrative bound, not a real threshold this credit is subject to |
| Debt increase that would breach it (approx.) | N/A — no covenant to breach. Illustrative only: even a doubling of gross debt to ~$167bn at a broadly similar average coupon would raise TTM interest expense to roughly $4.0bn (calc: $2,029m × (167,328/83,664) ≈ $4,058m), still leaving EBITDA/interest near 27.6x — coverage headroom against any plausible near-term debt increase is very wide in ratio terms, even as the dollar interest bill keeps climbing off a low base |

## 4. Coverage / Covenant Read

Earnings cover interest by a wide margin today — EBITDA/interest of 55.2x (TTM, $112,056m/$2,029m) and (EBITDA − capex)/interest of 11.2x — but that coverage ratio has compressed from 129.9x (FY2023) to 87.5x (FY2025) to 55.2x (TTM) as interest expense has nearly quintupled on five bond issuances since Aug-2022, most recently $30,000m (Nov-2025) and $25,000m (May-2026), only part of which has yet flowed through the TTM interest line — so further near-term compression toward roughly 36x (the single-quarter Q2'26 interest run-rate annualized) is a real, disclosed forward dynamic, not a speculative call. There is no tightest covenant to name because there is no maintenance financial covenant at all: Meta's Notes are explicitly disclosed as carrying none, and there is no revolver or credit facility to attach a springing covenant to — a genuinely favorable structural fact (zero contractual covenant-breach risk today), which this report distinguishes from the weaker "not disclosed" case the module's partial-data rule is written for. What would actually threaten this credit is not a covenant trip but the trend itself: continued heavy bond issuance funding a capex program (TTM capex $89,325m, +71% YoY) running well ahead of free cash flow (TTM FCF $37,872m, −20% YoY per `earnings/01_historical-financials.md`), which is the mechanism compressing coverage quarter over quarter even from an extremely high starting level.

