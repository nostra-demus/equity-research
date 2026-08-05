# Downside Stress Test — SMPL

**Reporting currency:** US dollars (USD). **Fiscal year:** ends the last Saturday in August. All figures below are as of the most recent balance-sheet date, May 30, 2026 (Q3 FY2026 10-Q), consistent with `01`–`05`. Today's date is 2026-08-06.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $234.6M (company-defined Adjusted EBITDA, TTM through May 30, 2026) | `01_capital-structure-and-leverage.md` §7; `04_coverage-and-covenants.md` §1 |
| Net debt | $276.1M (strict basis — the canonical figure `01` designates) | `01_capital-structure-and-leverage.md` §4/§7 |
| Net debt / EBITDA | 1.18x | `01` §5, §7 |
| EBITDA / interest | 11.7x on the TTM-blended interest figure ($20.0M, per `04`); **10.3x on the forward run-rate interest ($22.8M = $400.0M × 5.7% effective rate)** — this report uses the forward figure throughout Section 2, because the $20.0M TTM figure partly reflects the period before the Nov-19-2025 $150.0M upsize and understates the interest the current $400.0M balance actually costs going forward | `04_coverage-and-covenants.md` §1; `02_maturity-wall-and-refinancing.md` §3 |
| Tightest covenant + threshold | Max total net leverage ratio ≤6.00:1.00 (**springing** — only tested when revolver draws exceed 30% of the $75.0M commitment, i.e. $22.5M; not currently active, revolver is undrawn) | `04_coverage-and-covenants.md` §2/§3 |
| Next-12m obligations | $0.0M (no debt maturities before March 2030; no dividend; buybacks are explicitly discretionary, "does not obligate the Company to acquire any specific number of shares") | `02_maturity-wall-and-refinancing.md` §1; `03_liquidity-runway.md` §2 |
| Committed liquidity | $197.8M (cash $123.9M + confirmed, non-borrowing-base revolver availability $73.9M; no minimum-liquidity covenant exists to net out, and no restricted/trapped cash is disclosed) | `03_liquidity-runway.md` §1 |
| Floating-rate debt (gross) | $400.0M — 100% of gross debt, unhedged | `01` §1; `02` §3 |
| Hedge coverage (if any) | None disclosed — no interest-rate swap or cap in the pool | `01` §1; `02` §3 |
| Working-capital seasonality / peak build | Mild (Q1 consistently the smallest quarter at ~23–24% of annual revenue, Q3/Q4 the largest at ~25–28%; no discrete peak-quarter cash figure disclosed) | `03_liquidity-runway.md` §3 ("Seasonality / Peak Liquidity Need") |

**EBITDA basis:** company-defined non-GAAP Adjusted EBITDA (excludes loss on impairment, stock-based compensation, integration costs, inventory step-up, term-loan fees, restructuring). GAAP EBITDA TTM is **negative** ($(213.1)M), driven entirely by $391.9M of non-cash goodwill/brand impairment across the trailing four quarters — it is excluded here because it is not usable as a leverage or coverage denominator, not because it is being ignored (`01` §5/§7). **Cash-backing caveat, carried forward from `earnings/06_earnings-quality.md`:** cash conversion of this Adjusted-EBITDA base (CFO ÷ Adjusted EBITDA) has fallen from 80.1% (FY2024) to 62.9% (Latest TTM) — roughly 37% of the $234.6M base is not showing up as operating cash in the same period. This does not change the EBITDA figure used below (it is still the best available, impairment-adjusted denominator, and no fully-reconciled "cash EBITDA" alternative is disclosed), but it means the coverage and leverage ratios below rest on an earnings base with real, worsening — not yet broken — cash-conversion risk, and the liquidity-side math in Section 2 (which is built off actual TTM free cash flow (FCF), not EBITDA) already reflects that weaker conversion directly.

**Cyclicality calibration check:** `business-model/10_external-dependency.md` scores SMPL 52/100 ("partly externally driven," not the "mostly externally driven" band) and `business-model/07_business-quality.md` scores cyclicality 65/100 (higher = less cyclical), describing packaged snack food as "historically defensive, low-macro-cyclicality." SMPL is **not** flagged as a deep cyclical/commodity name under this module's rule, so the mandatory trough-to-peak history-calibrated haircut is not triggered — the −30/−40/−60% set below is the full required scenario set. (Note: Adjusted EBITDA margin is nonetheless at a genuine multi-year trough — 16.9% TTM vs 19–20% FY2024–FY2025 — but per `01` §5 this makes current-period leverage a slightly conservative, not flattering, starting point for the haircuts that follow.)

**No pending acquisition found** in `business-model/11_capital-allocation-governance.md` or elsewhere in the data pool — the pro-forma adjustment in step 2a of this agent's workflow does not apply. The stress base below is the reported, as-filed balance sheet.

---

## 2. Stress Scenarios

All figures computed directly (Python, shown below); net debt is held constant at $276.1M across the EBITDA-only haircuts, per the module rule to hold the covenant's debt metric fixed unless a stress specifically moves it. The two combined scenarios move a second variable (a cash shock or interest expense) on top of the −40% EBITDA haircut; neither the working-capital shock nor the rate shock changes net debt or EBITDA, so leverage and covenant headroom are unchanged from the −40% column in those two scenarios — only the liquidity gap moves.

```
h        EBITDA   NetLev  EBITDA/Int  Headroom%  StressedFCF
0.00     234.60    1.177      10.289      80.39       119.40
0.30     164.22    1.681       7.203      71.98        66.62
0.40     140.76    1.961       6.174      67.31        49.02
0.60      93.84    2.942       4.116      50.96        13.83
```
(Executed via Bash/Python; formulas: NetLev = 276.1 / EBITDA(h); EBITDA/Int = EBITDA(h) / $22.8M forward-run-rate interest; Headroom% = (6.00 − NetLev)/6.00; StressedFCF(h) = $119.4M TTM FCF − EBITDA·h·(1 − 25% tax), per the FCF-scaling assumption in Section 3.)

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA ($M) | 234.6 | 164.2 | 140.8 | 93.8 | 140.8 | 140.8 |
| Net debt / EBITDA | 1.18x | 1.68x | 1.96x | 2.94x | 1.96x | 1.96x |
| EBITDA / interest | 10.3x | 7.2x | 6.2x | 4.1x | 6.2x | 4.6x (interest rises to $30.8M) |
| Tightest covenant headroom (springing 6.00x ceiling) | +80.4% | +72.0% | +67.3% | +51.0% | +67.3% | +67.3% |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap (uses − sources; negative = surplus) | −$119.4M (surplus) | −$66.6M (surplus) | −$49.0M (surplus) | −$13.8M (surplus) | −$7.3M (surplus) | −$41.0M (surplus) |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**Working-capital shock, labeled assumption:** no discrete seasonal peak-build dollar figure is disclosed (`03` §3), so per the module's partial-data rule this uses a labeled assumption of 3% of TTM revenue ($1,392.2M × 3% = $41.8M) as a one-time added cash outflow inside the 12-month window, layered on the −40% EBITDA haircut. *Inference, not from filings.* Even under this shock, stressed FCF ($49.0M) still exceeds the shock, leaving a thin but positive $7.3M surplus against $0 committed obligations — before even touching the $197.8M of committed liquidity.

**Rate shock:** +200bps on the entire $400.0M floating-rate, unhedged balance = +$8.0M/year of cash interest (not tax-effected — a conservative simplification), layered on the −40% EBITDA haircut. Interest rises to $30.8M; EBITDA/interest falls to 4.6x; stressed FCF falls to $41.0M, still comfortably a surplus against $0 committed obligations.

**Market closure test** (no new unsecured refinancing for 12 months): irrelevant to the next 12 months by construction — $0 of debt matures in that window (`02` §1), so market closure changes nothing about the base case or any of the six columns above. It would only start to matter as the March 2030 maturity approaches, which is outside this stress test's 12-month liquidity window.

---

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches (springing 6.00x net-leverage ceiling) | **~80.4%** |
| Committed liquidity exhausted within 12 months | **Not reached on an EBITDA decline alone (h ≥ 100%)** |
| Net leverage exceeds an indicative market-refi stress threshold (5.00x, labeled assumption — see note) | **~76.5%** |

**(a) Covenant breach — solve, MAX/ceiling form:**
`h = 1 − net debt / (T · EBITDA) = 1 − 276.1 / (6.00 × 234.6) = 1 − 276.1 / 1,407.6 = 0.8039` → **80.4%** EBITDA decline, taking EBITDA to $46.0M against a constant $276.1M net debt. This matches `04_coverage-and-covenants.md` §3's independently-computed figure exactly (cross-check passes). This exceeds even the module's most severe standard haircut (−60%, which leaves leverage at only 2.94x) — the covenant is not a near-term risk on EBITDA decline alone. **The more relevant near-term trigger is structural, not an EBITDA move**: the covenant is currently inactive and only springs if the revolver is drawn past $22.5M (30% of the $75.0M commitment). A severe-enough downside that forces the company to draw the revolver for liquidity — rather than a pure earnings decline — is what would actually turn this covenant "on," and would do so well before leverage itself approached 6.00x.

**(b) Liquidity exhaustion — solve:** `committed liquidity + stressed FCF(h) = next-12-month obligations`, i.e. `$197.8M + [$119.4M − $234.6M·h·(1−0.25)] = $0.0M` → solving gives `h = ($197.8M + $119.4M) / ($234.6M × 0.75) = 1.803` — **h ≥ 100%, i.e. not reached on an EBITDA decline alone.** Sanity check at a full (100%) EBITDA wipeout: stressed FCF = $119.4M − $234.6M×0.75 = −$56.6M; liquidity ($197.8M) plus that stressed FCF still nets to a **positive** $141.3M — no 12-month shortfall even if Adjusted EBITDA fell to zero. This is a direct consequence of two structural facts, not an artifact of the formula: (i) $0 of debt is due in the next 12 months (the bullet structure means there is nothing for a bad year to collide with), and (ii) $197.8M of committed liquidity is large relative to the company's fixed cash costs. **FCF-scaling assumption stated plainly:** lost EBITDA is assumed to drop through to FCF at (1 − 25% effective tax rate), holding cash interest and capex fixed — this is the standard scaling this report uses per the module rule, and it is the more conservative of the two components (it assumes the full after-tax EBITDA loss hits cash, with no working-capital offset).

**(c) Net leverage exceeds a market-refi stress threshold:** No SMPL-specific refinancing-market leverage ceiling is disclosed in the pool. This row uses a **labeled assumption** of 5.00x — a round threshold below the company's own 6.00x covenant, illustrating where a BB−-type credit typically begins to see leveraged-loan market friction (*Inference, not from filings*). `h = 1 − 276.1 / (5.00 × 234.6) = 1 − 276.1 / 1,173.0 = 0.7646` → **76.5%**. Because this indicative threshold is below the actual 6.00x covenant, it triggers slightly before the covenant would (76.5% vs 80.4%) — but both are far beyond the module's standard −60% severe-case haircut, and both should be read as low-confidence, illustrative bookends, not hard limits.

---

## 4. Survival Read

The structure does not break on the standard −30/−40/−60% haircuts, and does not come close: even the most severe mandated case (−60% EBITDA, taking Adjusted EBITDA to $93.8M) leaves net leverage at 2.94x against a 6.00x springing covenant (still inactive) and a $13.8M annual FCF surplus against $0 of committed 12-month obligations. The first thing that would actually break is the covenant, and only at an ~80% EBITDA decline — a level this report is not aware of any precedent for in SMPL's own history and that would require Adjusted EBITDA to fall from $234.6M to roughly $46.0M. Liquidity does not run out on an EBITDA decline alone at any decline up to and including 100% (a full wipeout), because the entire $400.0M debt stack is a single bullet due March 2030 with $0 due in the next 12 months — a 30–40% decline, a normal recession and not a tail event, is survivable on the covenant and liquidity axes with no waiver, asset sale, or equity raise needed. The market closure test changes nothing for the next 12 months, because nothing is due in that window regardless of whether refinancing markets are open.

The real vulnerability this report finds is not modeled by the standard haircuts, because it is a policy choice, not a committed obligation: SMPL spent $213.2M on discretionary share buybacks in the 39 weeks ended May 30, 2026 (an annualized pace of roughly $284.3M) against just $92.1M of FCF over the same window, funding the gap partly with a fresh $150.0M debt draw (`03` §4; `01` §6). If that buyback pace continued unabated through a −40% EBITDA decline, the funding gap versus stressed FCF and committed liquidity combined would be roughly $37M within 12 months (($284.3M buyback pace − $49.0M stressed FCF) − $197.8M liquidity); at −60%, the gap widens to roughly $73M — figures computed here, not in the mandated tables above, because they assume a policy the company is not obligated to continue (per its own "does not obligate the Company to acquire any specific number of shares" language) and the module's convention correctly excludes discretionary buybacks from committed near-term obligations. In plain terms: the balance sheet survives a real recession on its own; the only way it gets into trouble inside 12 months is if management keeps buying back stock at the current pace straight through a serious earnings decline, which is a discretionary decision management can reverse at any time, not a structural weakness of the debt itself.

Out-of-scope request received: none. No probability is assigned to any of the above scenarios — that judgment belongs to the master synthesizer.
