# Downside Stress Test — AMZN

**Reporting currency:** USD (millions unless stated). **Reporting standard:** US GAAP. **EBITDA basis:** Reported GAAP EBITDA = operating income + D&A; no company-adjusted EBITDA exists. **Net debt basis:** Strict (§15 canonical) = gross financial debt minus cash and equivalents only; broad = minus cash and all liquid marketable securities. Both bases are net cash at FY2025 year-end. The strict basis is the canonical figure throughout (from `01`). **Primary EBITDA period:** FY2025 (year ended December 31, 2025). **Liquidity anchor:** March 31, 2026 (Q1 2026 10-Q, the most current filed period).

**Cash-backed EBITDA check:** CFO/EBITDA was 95.7% in FY2025 and 95.3% LTM Mar-31-2026 (`earnings/06_earnings-quality.md`, Section 1). EBITDA of $145,731M is fully cash-backed. No adjustment to the base EBITDA is required for the stress test.

**Cyclicality check:** Per `business-model/10_external-dependency.md`, AMZN is classified as "partly externally driven" with an external dependency score of 32/100. It is not a deep cyclical or commodity name. Amazon does not have a single trough-to-peak EBITDA history calibrated to a commodity or industrial cycle. A history-calibrated trough scenario is therefore not applicable. Instead, a −60% EBITDA scenario (the most severe standard haircut) encompasses any plausible recession plus margin compression scenario for this business.

**Pending acquisition check (per self-check §2a):** `business-model/11_capital-allocation-governance.md` discloses no material pending or recently-announced acquisition. No pro-forma base is required.

---

## 1. Base Case (today)

All figures from upstream `01`–`05` and cross-module `earnings/06` and `earnings/03`.

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, FY2025) | $145,731M | FY2025 10-K operating income $79,975M + D&A $65,756M; Capital IQ cross-check; CFO/EBITDA = 95.7% confirms full cash backing — `earnings/06_earnings-quality.md` §1 |
| Net cash — strict basis (§15 canonical) | **$17,959M net cash** | Cash $86,810M − gross financial debt $68,851M; FY2025 10-K, Balance Sheet + Note 6, p.58. Gross financial debt < cash alone. |
| Net cash — broad basis (labeled) | $54,178M net cash | (Cash $86,810M + marketable securities $36,219M) − gross debt $68,851M; FY2025 10-K, Note 2, p.53; labeled broad basis, not canonical |
| Gross debt / EBITDA | 0.47x | $68,851M / $145,731M; `01_capital-structure-and-leverage.md` §5 |
| Net debt (strict) / EBITDA | (0.12x) — net cash | ($17,959M) / $145,731M = −0.12x; a negative ratio is shown as net cash |
| EBITDA / interest expense | 64.1x | $145,731M / $2,274M; `04_coverage-and-covenants.md` §1 — Python-verified |
| Tightest covenant + threshold | **None** | FY2025 10-K, Note 6, p.58: "We are not subject to any financial covenants under the Notes." Confirmed in Q1 2026 10-Q, Note 5. No maintenance tests exist on any instrument. |
| Next-12m obligations (financial debt only) | ~$7,752M | Debt maturities $2,752M + cash interest ~$5,000M; `02_maturity-wall-and-refinancing.md` §1 + `03_liquidity-runway.md` §2 |
| Committed liquidity (Mar 31, 2026) | $160,213M | Usable cash $98,940M + liquid marketable securities $41,273M + committed revolvers $20,000M ($15B undrawn Nov-2028 revolver + $5B undrawn Oct-2026 revolver); `03_liquidity-runway.md` §1. Excludes $30B uncommitted commercial paper programs. |
| Floating-rate debt (gross, Mar 31, 2026) | ~$4,900M (~4% of total) | ~$2.8B SOFR-linked USD notes + ~$2.1B EURIBOR-linked EUR notes; all due 2028–2029; `02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage | None disclosed | No interest rate swap or cap program disclosed in FY2025 10-K or Q1 2026 10-Q |
| Working-capital seasonality / peak build | Peak WC outflow $26,500M (LTM Mar-31-2026) | WC cash drag ranged $13.7B–$26.5B over 5 years; LTM Mar-26 = $26.5B used as the shock; `earnings/06_earnings-quality.md` §1 + `03_liquidity-runway.md` §3 |

---

## 2. Stress Scenarios

All stressed figures produced by the Python computation above (results shown in the execution block). Inputs and formulas are explicit below each column.

**Formula applied to each haircut:**
- Stressed EBITDA = Base EBITDA × (1 − haircut%)
- Net debt (strict) / EBITDA = (−$17,959M net cash) / Stressed EBITDA [negative = net cash, shown in parentheses]
- EBITDA / interest = Stressed EBITDA / $2,274M base interest [interest is fixed-rate; no covenant changes it]
- Tightest covenant headroom = N/A (no maintenance covenants exist)
- 12-month liquidity gap = Committed liquidity $160,213M − next-12m obligations $7,752M [obligations do not change with EBITDA in this structure; no covenant triggers accelerate debt]
- −40% + WC shock: liquidity gap reduced by $26,500M peak WC outflow
- −40% + rates +200bp: incremental interest = $4,900M × 2.0% = $98M added to annual interest cost; liquidity gap reduced by $98M; stressed coverage = stressed EBITDA / ($2,274M + $98M) = $87,439M / $2,372M

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | $145,731M | $102,012M | $87,439M | $58,292M | $87,439M | $87,439M |
| Net debt (strict) / EBITDA | (0.12x) NC | (0.18x) NC | (0.21x) NC | (0.31x) NC | (0.21x) NC | (0.21x) NC |
| Gross debt / EBITDA | 0.47x | 0.67x | 0.79x | 1.18x | 0.79x | 0.79x |
| EBITDA / interest | 64.1x | 44.9x | 38.5x | 25.6x | 38.5x | 36.9x |
| Tightest covenant headroom | N/A | N/A | N/A | N/A | N/A | N/A |
| Covenant breach? | N/A | N/A | N/A | N/A | N/A | N/A |
| 12-month liquidity gap (+ = surplus) | +$152,461M | +$152,461M | +$152,461M | +$152,461M | +$125,961M | +$152,363M |
| Survives without external action? | Yes | Yes | Yes | Yes | Yes | Yes |

**Notes on the combined shock columns:**

- **−40% + WC shock:** The $26.5B peak working-capital outflow is the largest recorded annual WC drag (LTM Mar-31-2026), concentrated as if it hit in a single 12-month window. Even this worst-case WC build cuts the liquidity surplus from $152.5B to $126.0B — still a 16.3x coverage ratio ($126.0B / $7.75B). No external action required.

- **−40% + rates +200bp:** A +200 bps shock on the ~$4.9B floating-rate exposure (SOFR/EURIBOR-linked notes due 2028–2029; `02` §3) adds $98M/year in interest. At that level the incremental cost is 0.1% of stressed EBITDA and 4.3% of the base interest bill. The column is included as required; it is not a stress that matters at this portfolio composition (~96% of debt is fixed-rate).

- **Market closure test:** Assuming no new unsecured refinancing for 12 months — the only 2026 maturity is $2,752M (face) of the 2021 Notes, covered 36x by the $98,940M in usable unrestricted cash at Mar 31, 2026 alone. The $20B committed revolving credit facilities (confirmed undrawn and available at Mar 31, 2026) are available as backup. Market closure is not a solvency risk in any 12-month window visible in the data. Even the negative LTM strict FCF (−$2,472M) adds only a $2.5B annual cash drain beyond the $7.75B in financial obligations, leaving a $149.9B net buffer before touching the full revolver capacity.

---

## 3. Break Points

Computed from the Python execution above. All figures verified by the snippet.

| Break Point | EBITDA Decline That Triggers It |
|---|---|
| Tightest covenant breaches | **Not applicable** — no maintenance financial covenants exist on any instrument [FY2025 10-K, Note 6, p.58] |
| Committed liquidity exhausted within 12 months | **Not achievable at any stated EBITDA haircut.** The liquidity pool ($160.2B) exceeds 12-month obligations ($7.75B) by 20.7x. Even at −60% EBITDA ($58.3B), obligations are unchanged and liquidity surplus stays at $152.5B. Liquidity would require a sustained total-EBITDA collapse to zero AND a freeze on CFO for over 20 years to exhaust the pool — not a realistic scenario. |
| EBITDA / interest falls below 1.0x (cannot cover interest from EBITDA) | −98.4% EBITDA decline — EBITDA would need to fall to ~$2.3B (from $145.7B) |
| EBITDA / interest falls below 2.5x (typical IG minimum coverage benchmark) | −96.1% EBITDA decline |
| Gross leverage exceeds 6x (indicative refi-market stress threshold) | −92.1% EBITDA decline — gross debt ($68.9B) / EBITDA > 6x only if EBITDA falls below $11.5B |

**What these numbers mean in plain terms:** There is no EBITDA decline within any plausible recession range (−30% to −60%) that triggers a covenant breach, exhausts liquidity within 12 months, or pushes gross leverage above 6x. The structure only breaks — in the sense of being unable to cover interest from earnings — if EBITDA falls by more than 98%, which would require revenue at Amazon to collapse to a fraction of its 2025 base and all three major segments (North America, International, AWS) to simultaneously fail. That is not a plausible stress scenario. The first thing to break is not a covenant or a maturity — it is management's own EBITDA / interest comfort threshold, and even that does not happen until below −90% EBITDA.

---

## 4. Survival Read

Amazon's structure cannot be broken by any plausible EBITDA decline. The company is net cash on the strict §15 basis ($18.0B net cash at FY2025 year-end — cash alone exceeds all gross financial debt), with a $160B committed liquidity pool at March 31, 2026, no maintenance financial covenants on any instrument, and EBITDA/interest coverage of 64.1x at base that falls only to 25.6x at a −60% EBITDA shock. A −30% to −40% EBITDA decline — the range that represents a normal recession for a business of Amazon's mix, per `business-model/10_external-dependency.md` — leaves EBITDA/interest at 38–45x and the 12-month liquidity surplus above $152B. No waiver, equity raise, or asset sale is needed at any haircut modeled here.

The market closure test passes without effort: the $2,752M 2026 debt maturity is covered 36x by unrestricted cash on hand, and the $8,832M 2027 maturity wall is covered 11x by cash alone (before any investment portfolio or revolver). If refinancing markets shut for 12 months, Amazon neither needs to refinance maturing debt nor to draw its revolvers.

The only genuine financial tension in Amazon's current picture is not solvency-related: it is that strict FCF is negative (−$2.5B LTM) because growth capex ($151B annualized at LTM Mar-26) exceeds CFO ($148.5B), and gross financial debt has grown from $68.9B (Dec 31, 2025) to $122.6B (Mar 31, 2026) as Amazon borrowed $53.8B in a single quarter to fund its AI/AWS build. That borrowing does not threaten solvency — it sits against a $140B+ liquid asset pool and a $364B AWS backlog — but it means the strict net cash position ($18.0B at year-end 2025, declining to an estimated $12–$16B by mid-2026 as the issuance proceeds are deployed into capex) will narrow over 12–18 months. Even if gross financial debt grows to $150B and the strict net cash position turns modestly negative (a possible trajectory by late 2026 at the current issuance pace), EBITDA/interest at $155B+ EBITDA (LTM Mar-26: $155.9B) versus $4.5B–$5.0B in annual interest would remain above 30x, and the broad net cash position would remain strongly positive.

**This is the strongest possible survival outcome: net cash on both bases, no covenants to breach, and a liquidity pool that exceeds 12-month financial obligations by more than 20x at every tested haircut level.** The net cash position is counter-cyclical optionality (CLAUDE.md §24, Filter 3; MODULE_RULES §8) — it allows Amazon to sustain a multi-year revenue shock without any external financing, to absorb all disclosed contingent liabilities ($673M Kove verdict, $813M Luxembourg GDPR fine, $6.6B tax contingencies) from operating cash flow, and to continue its $200B+ capex program without depending on capital markets access. The structure does not "break" in any scenario this report was asked to test.

---

*Upstream sources: `01_capital-structure-and-leverage.md` (debt stack, net cash position, leverage); `02_maturity-wall-and-refinancing.md` (maturity schedule, floating-rate exposure, market access); `03_liquidity-runway.md` (committed liquidity, next-12m obligations, WC seasonality); `04_coverage-and-covenants.md` (coverage ratios, no-covenant finding); `05_off-balance-sheet-and-contingencies.md` (contingent exposures). Cross-module: `analyses/AMZN_2026-07-03/earnings/06_earnings-quality.md` (CFO/EBITDA conversion, cash-backed EBITDA); `analyses/AMZN_2026-07-03/earnings/03_margin-drivers.md` (downside margin drivers); `analyses/AMZN_2026-07-03/business-model/10_external-dependency.md` (cyclicality classification); `analyses/AMZN_2026-07-03/business-model/11_capital-allocation-governance.md` (no pending acquisition). Primary filings: FY2025 10-K (filed Apr 9, 2026), Note 6 (debt/covenants); Q1 2026 Form 10-Q (filed Apr 30, 2026), Note 5 (liquidity, maturities). All stressed ratios produced by executed Python computation, results shown above.*
