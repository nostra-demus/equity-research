# Capital Structure & Leverage — META

Reporting currency: **USD, in millions** unless stated otherwise. Reporting standard: US GAAP. Fiscal year end: December 31. Balance-sheet dates used: latest interim = June 30, 2026 (Q2 FY2026 10-Q, filed Jul-30-2026); latest audited annual = December 31, 2025 (FY2025 10-K, filed Jan-29-2026).

## 1. Debt Stack

Meta Platforms, Inc. is a single-entity issuer — there is no HoldCo/OpCo structure and no subsidiary guarantor complexity disclosed. All debt is issued directly by the parent.

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Short-term debt / current portion | $0 | Meta Platforms, Inc. | N/A | N/A | N/A | N/A — future principal payments schedule shows $0 due "Remainder of 2026" | N/A | Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19 |
| Bonds / notes (five series) | $84,000 face value ($83,664 carrying, net of $336m unamortized discount/issuance costs) | Meta Platforms, Inc. | No — unsecured | Senior unsecured; "each series of the Notes ranks equally with each other" | None (unsecured) | Staggered 2027–2066 by series (Aug-2022 Notes 2027–2062 $10,000; May-2023 Notes 2028–2063 $8,500; Aug-2024 Notes 2029–2064 $10,500; Nov-2025 Notes 2030–2065 $30,000; May-2026 Notes 2031–2066 $25,000) | Fixed — stated rates range 3.50%–6.45% across series/tranches (effective rates 3.63%–6.48%) | Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19 |
| Term loans | Not disclosed — no term loan facility exists in the pool | — | — | — | — | — | — | 10-K/10-Q — no term-loan language found |
| Revolver (drawn) | $0 — no revolving credit facility, commercial paper program, or committed line of credit is disclosed anywhere in the 10-K or 10-Q | Meta Platforms, Inc. | N/A | N/A | N/A | N/A | N/A | 10-K/10-Q (search for "revolving," "credit facility," "commercial paper" returns no matches); confirmed in `00_solvency-data-triage.md` §3 |
| Finance / capital leases | $1,184 present value as of Dec 31, 2025 ($308 current + $876 non-current) — most recent year the amount is separately disclosed; not broken out as a distinct line on the Q2 FY26 condensed balance sheet (embedded within "Accrued expenses and other current liabilities" and "Other liabilities," per accounting-policy note) | Meta Platforms, Inc. | Asset-secured (leased network infrastructure) | Structurally senior to unsecured notes only to the extent of the leased asset; not otherwise ranked | Leased network infrastructure | Weighted-average remaining term 15.1 years (FY2025); weighted-average discount rate 4.1% (FY2025) | Fixed (imputed discount rate) | FY2025 10-K, Leases note (Note 6), pp. — lease-liability maturity schedule and PV table |
| **Total gross debt (funded debt only, matches Balance Sheet "Long-term debt" line)** | **$83,664** (carrying value, Jun 30, 2026); $58,744 (Dec 31, 2025) | — | — | — | — | — | — | Q2 FY26 10-Q, Consolidated Balance Sheets |

**Debt-scope note (US GAAP vs IFRS 16, per MODULE_RULES Calculation Standard #2):** Meta's own balance sheet and debt note treat only the fixed-rate senior unsecured Notes as "debt" (Long-term debt line = $83,664m). Operating lease liabilities ($28,654m at Jun 30, 2026 — see §2) are recognized under US GAAP (ASC 842) as a separate balance-sheet liability but are **not** included in the debt note or in "Long-term debt." If those operating lease liabilities were capitalized as debt (the IFRS 16-style view), total debt-like obligations would be **≈$113,502m** ($83,664 Notes + $28,654 operating leases + $1,184 finance leases). Capital IQ's own vendor "Total Debt" field for META is $112,318m [Capital IQ Financials_Annual export, LTM through 2026-06-30, cited in `business-model/11_capital-allocation-governance.md`] — this reconciles almost exactly to Notes ($83,664) + operating lease liabilities ($28,654) = $112,318, i.e. the CIQ figure appears to fold in operating leases but not finance leases. This module's canonical "gross debt" is the filing's own funded-debt figure ($83,664m); the lease-inclusive view is shown for completeness and must be labelled whenever cited (§15/§27 hygiene — never present the CIQ vendor aggregate under the filing's name).

Meta does not have preferred stock outstanding: its certificate of incorporation authorizes undesignated preferred stock, but no shares are issued and the stockholders' equity section of the balance sheet carries no preferred-stock line [Q2 FY26 10-Q, Risk Factors p.22; Consolidated Balance Sheets].

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating leases (US GAAP note) | $28,654 present value as of Jun 30, 2026 ($2,425 current + $26,229 non-current); $25,153 at Dec 31, 2025 ($2,213 current + $22,940 non-current). Weighted-average remaining term 12.3 years, weighted-average discount rate 4.3% (FY2025) | Recognized on-balance-sheet as a separate liability under US GAAP (ASC 842) — not classified as "debt" in the company's own debt note. Data centers, offices, and colocations. | Q2 FY26 10-Q, Consolidated Balance Sheets; FY2025 10-K, Leases note |
| Pension / OPEB underfunding | Not material — no defined-benefit pension or OPEB plan disclosed. A 10-K text search for "pension"/"defined benefit"/"OPEB" returns only an unrelated litigation case name (a shareholder-plaintiff pension trust); the Capital IQ Pension-OPEB tab is blank in both annual and quarterly workbooks. | N/A | FY2025 10-K (full-text search); Capital IQ Financials_Annual/Quarterly, Pension-OPEB tabs |
| Preferred equity | $0 outstanding (authorized but unissued) | N/A | Q2 FY26 10-Q, Risk Factors p.22; Consolidated Balance Sheets (no preferred-stock line) |
| Non-cancelable purchase commitments (not debt, flagged for context) | $349,310 as of Jun 30, 2026 (up from $131,050 at Dec 31, 2025 per prior-period disclosure), of which $53,520 due in 2026 and $81,650 due in 2027; plus a separate $14,720 contingent cloud-capacity obligation | Off-balance-sheet contractual commitment, mostly third-party cloud capacity and data-center/server/network infrastructure for the AI buildout — **not** funded debt and not included in gross debt above. Owned in full by `05_off-balance-sheet-and-contingencies`; shown here only so the reader is not misled that the debt stack in §1 is the company's full forward obligation. | Q2 FY26 10-Q, Note 9 (Commitments and Contingencies) |

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | $15,462 (Jun 30, 2026); $35,873 (Dec 31, 2025) | No | Q2 FY26 10-Q, Consolidated Balance Sheets |
| Liquid short-term investments (Marketable securities) | $74,798 (Jun 30, 2026); $45,719 (Dec 31, 2025) — government/agency securities, investment-grade corporate debt, money market funds, and marketable equity securities, classified Level 1/2 fair value | No | Q2 FY26 10-Q, Consolidated Balance Sheets; MD&A "Liquidity and Capital Resources," p.33 |
| Restricted / trapped cash (flag) | $13,550 restricted cash equivalents as of Jun 30, 2026, of which $10,800 is escrow-related money market funds tied to multi-year AI-infrastructure purchase agreements. **Restricted from general corporate use**; expected release 2028–2030 as the underlying purchase obligations are satisfied. Classified within "Other assets," **not** inside the $15,462 cash-and-equivalents line above (so no double-count risk, but this cash is not usable liquidity today). | Yes — explicitly restricted | Q2 FY26 10-Q, Note on Restricted Cash Equivalents (referencing Note 9, Commitments and Contingencies) |

## 4. Gross & Net Debt

All figures as of June 30, 2026 unless noted. Total cash + liquid investments = $15,462 + $74,798 = **$90,260**, consistent with the 10-Q's own MD&A statement that "Cash, cash equivalents, and marketable securities were $90.26 billion as of June 30, 2026."

| Metric | Value | Source |
|---|---:|---|
| Gross debt (funded debt only) | $83,664 | Q2 FY26 10-Q, Consolidated Balance Sheets / Note 8 |
| − Cash & equivalents | $15,462 | Q2 FY26 10-Q, Consolidated Balance Sheets |
| **Net debt (strict, §15)** | **$68,202** | Calculated: 83,664 − 15,462 |
| − Liquid short-term investments (marketable securities) | $74,798 | Q2 FY26 10-Q, Consolidated Balance Sheets |
| **Net debt (broad, incl. investments)** | **−$6,596 (net CASH of $6,596)** | Calculated: 83,664 − 90,260 |

**This is a material, sign-flipping divergence and must be carried with its basis label at every layer downstream.** On the strict §15 basis (cash & equivalents only), META shows net debt of $68.2bn. On the broad basis (also netting the $74.8bn of marketable securities, which Meta's own MD&A groups together with cash as its "principal sources of liquidity"), META is net CASH by $6.6bn. Per MODULE_RULES Calculation Standard #3, **strict is designated the module's canonical net-debt figure by default**, and no stated reason overrides that default here — so §7 below carries the strict figure as canonical, with the broad figure shown alongside, labelled, for downstream awareness. `02_maturity-wall-and-refinancing`, `03_liquidity-runway`, `04_coverage-and-covenants`, and `06_downside-stress-test` should each state explicitly which basis they use if they depart from strict.

## 5. Leverage Ratios

EBITDA basis used: **TTM reported/calculated EBITDA of $112,056m** (four quarters ended Jun-30-2026; = Operating Income + D&A, since Meta discloses no adjusted or GAAP EBITDA line item) [`earnings/01_historical-financials.md` §2, cross-checked against Q2 FY26 10-Q and Capital IQ quarterly export]. A comparable FY2025 annual reported-EBITDA figure ($101,892m) is shown alongside for the year-end point. Meta does not disclose an adjusted EBITDA, so the "On Adjusted EBITDA" column is not assessable and is marked n/a throughout — no separate GAAP-vs-adjusted reconciliation is needed because there is only one (reported/calculated) basis.

| Ratio | On Reported EBITDA (TTM $112,056m) | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | 0.75x (83,664 / 112,056) | n/a — not disclosed | Calculated from §1 and §5 EBITDA base |
| Net debt / EBITDA (strict, canonical) | 0.61x (68,202 / 112,056) | n/a — not disclosed | Calculated from §4 strict net debt |
| Net debt / EBITDA (broad, for context) | −0.06x — net cash (−6,596 / 112,056) | n/a — not disclosed | Calculated from §4 broad net debt |
| Debt / capital | 24.3% (83,664 / [83,664 + 261,221 total stockholders' equity]) | n/a | Q2 FY26 10-Q, Consolidated Balance Sheets |
| Debt / equity | 32.0% (83,664 / 261,221) | n/a | Q2 FY26 10-Q, Consolidated Balance Sheets |

**Cycle-position note:** `business-model/10_external-dependency.md` does **not** classify META as a deep cyclical or commodity name — its External Dependency Risk Score is 55/100 ("partly externally driven," largest single lever is advertiser-budget sensitivity, not a classic commodity/industrial cycle). Per MODULE_RULES Calculation Standard #4, a normalised/mid-cycle EBITDA row is therefore not required and is not shown. That said, EBITDA margin has compressed in recent quarters (Q2 FY26 45.3%, −690bps YoY, per `earnings/01_historical-financials.md`) as AI-infrastructure depreciation ramps — this is a live margin trend for `06_downside-stress-test` to weigh, not a peak-vs-mid-cycle question.

## 6. Leverage Trend

| Metric | FY2023 | FY2024 | FY2025 | Latest (TTM period-end, Jun-30-2026) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, §15) | −$23,477 (net cash) | −$15,063 (net cash) | $22,871 | $68,202 | Rising sharply |
| Net debt / EBITDA | −0.41x | −0.18x | 0.22x | 0.61x | Rising sharply |

Source: `earnings/01_historical-financials.md` §1–§2 (net debt built as Long-term debt − cash & equivalents only, cross-checked against the FY2025 10-K balance sheet for FY2024–FY2025).

Leverage is **rising**, and the driver is unambiguous: five note issuances since Aug-2022 (cumulative $84,000m face value, most recently $30,000m in Nov-2025 and $25,000m in May-2026) have funded a capex buildout that has outrun free cash flow — capex grew from $37,256m (FY2024) to $69,691m (FY2025, +87%) and is running at $89,325m on a TTM basis (+71% YoY), while company-disclosed FCF fell from $52,103m (FY2024) to $43,585m (FY2025) and is down a further 20.4% YoY on a TTM basis to $37,872m [Q2 FY26 10-Q, Note 8; `earnings/01_historical-financials.md` §1–§2]. The flip from a multi-year net-cash position (net cash every year FY2021–FY2024) to net debt in FY2025 that has since more than doubled by mid-2026 has occurred alongside continued dividend payments ($2,699m in H1 FY2026) and no share repurchases in H1 FY2026 — i.e., the debt is funding the AI-infrastructure buildout, not distributions [`business-model/11_capital-allocation-governance.md`].

## 6A. HoldCo / OpCo & Structural Subordination

Not applicable — no material HoldCo-level debt indicated. Meta Platforms, Inc. is the single, direct issuer of all outstanding Notes; the 10-Q/10-K disclose no HoldCo/OpCo subordination structure, no subsidiary guarantors, and no upstreaming constraints [Q2 FY26 10-Q, Note 8 (Long-term Debt)].

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt (funded debt only, canonical):** $83,664m (carrying value; $84,000m face value), as of Jun 30, 2026. Excludes $28,654m of operating lease liabilities and $1,184m of finance lease liabilities (latest separately disclosed, Dec 31, 2025 basis) that are on-balance-sheet but not classified as "debt" under US GAAP; the lease-inclusive (IFRS 16-style) view is ≈$113,502m — label it explicitly if used. [Q2 FY26 10-Q, Consolidated Balance Sheets / Note 8]
- **Net debt — strict basis (§15), designated the module's canonical figure:** $68,202m (gross debt $83,664m − cash & equivalents $15,462m), as of Jun 30, 2026. [Q2 FY26 10-Q]
  - **Net debt — broad basis (also netting $74,798m marketable securities), shown for context, NOT canonical:** −$6,596m, i.e. **net CASH of $6,596m**. This is a materially different, sign-flipping read from the strict figure and must always carry its "broad" label if quoted downstream.
- **Cash & liquid investments:** $90,260m total ($15,462m cash & equivalents + $74,798m marketable securities), as of Jun 30, 2026. A further $13,550m of restricted cash equivalents exists (of which $10,800m is escrow tied to AI-infrastructure purchase commitments, released 2028–2030) but is excluded from this figure and from usable liquidity.
- **EBITDA base used:** $112,056m, TTM through Jun 30, 2026, **reported/calculated** (Operating Income + D&A — Meta discloses no adjusted or GAAP EBITDA line), **latest/current** basis. Not cycle-normalised: META is not classified as a deep cyclical/commodity name by `business-model/10_external-dependency.md` (score 55/100, "partly externally driven"), so no separate mid-cycle EBITDA figure applies. FY2025 annual reported EBITDA ($101,892m) is the comparable year-end anchor for §6's trend table.
- **Net debt / EBITDA, canonical (strict net debt ÷ reported TTM EBITDA):** 0.61x. On the FY2025 year-end point: 0.22x. On adjusted EBITDA: not assessable — not disclosed. On the broad (net-cash) basis: −0.06x (net cash).
- **Reporting currency:** USD, in millions.

**Estimation / basis flags for downstream propagation:** (1) The strict-vs-broad net debt divergence above ($68.2bn debt vs $6.6bn cash) is the single most consequential number in this report for `03_liquidity-runway` and `06_downside-stress-test` — carry both figures with their labels, do not silently pick one. (2) No adjusted EBITDA is disclosed by the company; every leverage/coverage ratio in this module rests on a calculated reported-EBITDA figure (Op. Income + D&A), not a company-defined non-GAAP measure — say so wherever the ratio is cited. (3) Finance lease liabilities are not separately disclosed on the Q2 FY26 interim balance sheet face; the $1,184m figure used above is the last full-year (Dec 31, 2025) disclosure and is flagged as dated. (4) META is net cash on a broad, investment-inclusive basis and has been net cash on the strict basis every year FY2021–FY2024; the FY2025–2026 net-debt build reflects a genuine capex-funded increase in leverage, not distress — this should be read alongside the rejection of the "optimal leverage" frame (CLAUDE.md §24, Filter 3): rising leverage funding a large capex programme is a capital-allocation and execution-risk question for other agents, not evidence in itself of fragility, given the coverage and liquidity levels shown here.
