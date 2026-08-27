# Downside Stress Test — META

## 1. Base Case (today)

Reporting currency: **USD, in millions**. EBITDA basis: **reported/calculated (Operating Income + D&A), TTM through Jun-30-2026** — Meta discloses no adjusted or GAAP EBITDA line item [`01_capital-structure-and-leverage.md` §5]. Net debt basis: **strict (§15)**, designated the module's canonical figure by `01` §4/§7; the broad (investment-inclusive) figure is shown alongside, labelled.

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $112,056m (TTM). Cash-backed: CFO/EBITDA ran 105%–124% every year FY2021–FY2025 (113.6% FY2025) — cash generation exceeds booked EBITDA every year, not an "addback illusion" concern | `01_capital-structure-and-leverage.md` §5; `earnings/06_earnings-quality.md` §2 |
| Net debt (strict, canonical) | $68,202m (net debt); broad basis (netting marketable securities) = **−$6,596m, i.e. net CASH of $6,596m** — sign-flipping divergence, carried with its label | `01_capital-structure-and-leverage.md` §4, §7 |
| Net debt / EBITDA | 0.61x (strict, canonical); −0.06x (broad, net cash) | `01_capital-structure-and-leverage.md` §5 |
| EBITDA / interest | 55.2x (TTM, $112,056m / $2,029m) | `04_coverage-and-covenants.md` §1 |
| Tightest covenant + threshold | **None exists** — "We are not subject to any financial covenants under the Notes" [Q2 FY26 10-Q, Note 8]; no revolver, so no springing covenant either. Illustrative typical covenants (labelled assumption, NOT real thresholds, per `04`'s own illustrative-benchmark table): max net leverage 4.0x–4.5x, min interest coverage 2.0x–3.0x | `04_coverage-and-covenants.md` §2–3 |
| Next-12m obligations | $5,398m = $0 debt maturities + $5,398m annualized dividends (interest $2,029m and total capex are already netted inside the FCF figure used below — not double-counted per MODULE_RULES §8) | `02_maturity-wall-and-refinancing.md` §2; `03_liquidity-runway.md` §2 |
| Committed liquidity | $90,260m = $15,462m cash & equivalents + $74,798m marketable securities. No revolver/facility exists (a genuine absence, not an "availability unknown" gap) | `03_liquidity-runway.md` §1 |
| Floating-rate debt (gross) | $0 — **100% of Meta's funded debt is fixed-rate** (all five Note series); no revolver, commercial paper, or term loan exists | `02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage (if any) | Not applicable to debt — there is no floating-rate debt to hedge. Meta uses short-term FX forwards on revenue/cash exposures (unrelated to the debt stack) | `business-model/10_external-dependency.md` §2 |
| Working-capital seasonality / peak build | Not materially seasonal. Disclosed annual working-capital swings run from +$5,683m (FY2022, cash source) to −$885m (FY2025, cash use) — both small relative to $90,260m of liquidity. No disclosed peak intra-year build | `03_liquidity-runway.md` §3 ("Seasonality / Peak Liquidity Need") |

## 2. Stress Scenarios

All dollar figures in USD millions. Every cell below was produced by an executed Python calculation (shown after the table), not by hand.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | 112,056 | 78,439 | 67,234 | 44,822 | 67,234 | 67,234 |
| Net debt / EBITDA (strict) | 0.61x | 0.87x | 1.01x | 1.52x | 1.01x | 1.01x |
| EBITDA / interest | 55.2x | 38.7x | 33.1x | 22.1x | 33.1x | 33.1x (unchanged — see note) |
| Tightest covenant headroom | No real covenant; illustrative max-leverage headroom +85.7% vs 4.25x | +79.5% (illustrative) | +76.1% (illustrative) | +64.2% (illustrative) | +76.1% (illustrative) | +76.1% (illustrative) |
| Covenant breach? (Y/N) | N — no covenant exists | N | N | N | N | N |
| 12-month liquidity gap | Surplus $122,734m (no gap) | Surplus $96,177m | Surplus $87,324m | Surplus $69,619m | Surplus $85,324m | Surplus $87,324m |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**Rate-shock column, labelled not applicable.** Meta's funded debt is 100% fixed-rate (§1) with no revolver or other floating instrument [`02_maturity-wall-and-refinancing.md` §3]. A +200bp rate shock therefore does not change interest expense on any existing debt — it only raises the coupon on future new issuance, which is not modelled here. The column is shown holding the −40% figures unchanged, labelled "not applicable — 0% floating exposure," per the module's instruction to include the column even where the shock cannot bite.

**Working-capital shock, labelled assumption.** `03_liquidity-runway.md` §3 discloses no peak intra-year working-capital build, so a $2,000m cash outflow is used as a labelled assumption — roughly 2.3x the largest disclosed annual working-capital cash use (FY2025, $885m) — applied on top of the −40% EBITDA haircut. This is a conservative sizing given META's actual disclosed swings are smaller and there is no separate inventory line.

**Illustrative covenant caveat.** META's Notes carry no maintenance financial covenants ("headroom" and "breach" cells above use the labelled, illustrative typical-market thresholds from `04` — 4.25x max net leverage / 2.5x min interest coverage midpoints — solely to give the reader scale; they are not thresholds META is actually bound by. Actual covenant breach risk on the Notes is not assessable because no real covenant exists, and every "N" (breach) cell above is trivially true for that reason as well as on the illustrative math.)

**Executed calculation (Python, run via Bash; command and full output shown):**

```
ebitda_base = 112056.0; net_debt = 68202.0; interest = 2029.0
fcf_base = 37872.0; liquidity = 90260.0; obligations_12m = 5398.0
tax_assumption = 0.21  # labelled assumption: US statutory federal rate — used because
                       # disclosed effective rates (11.8% FY2024, 29.6% FY2025) were
                       # both one-off-distorted and not representative of a marginal rate

def stressed(h):
    ebitda = ebitda_base*(1-h)
    lev = net_debt/ebitda
    cov = ebitda/interest
    fcf = fcf_base - ebitda_base*h*(1-tax_assumption)   # lost EBITDA drops to FCF after tax;
                                                          # cash interest & maintenance capex held fixed
    liq_plus_fcf = liquidity + fcf
    gap = obligations_12m - liq_plus_fcf   # positive = shortfall, negative = surplus
    return ebitda, lev, cov, fcf, liq_plus_fcf, gap

# Results (h, EBITDA, NetDebt/EBITDA, EBITDA/Interest, StressedFCF, Liq+FCF, 12m gap):
# 0.00  112056.0  0.6086  55.227  37872.0   128132.0  -122734.0  (surplus)
# 0.30   78439.2  0.8695  38.659  11314.7   101574.7   -96176.7  (surplus)
# 0.40   67233.6  1.0144  33.136   2462.3    92722.3   -87324.3  (surplus)
# 0.60   44822.4  1.5216  22.091 -15242.5    75017.5   -69619.5  (surplus)

# -40% + WC shock ($2,000m):
# gap = obligations_12m + 2000 - liq_plus_fcf(0.40) = 5398 + 2000 - 92722.3 = -85324.3 (surplus)

# Covenant breach solves (illustrative thresholds, labelled, not real covenants):
# Max net leverage 4.25x:  h = 1 - net_debt/(4.25*ebitda_base) = 1 - 68202/476238.0  = 0.8568
# Min interest coverage 2.5x: h = 1 - (2.5*interest)/ebitda_base = 1 - 5072.5/112056.0 = 0.9547
# Refi-market threshold 6.0x: h = 1 - net_debt/(6.0*ebitda_base) = 1 - 68202/672336.0 = 0.8986

# Liquidity exhaustion solve: 90260 + (37872 - 112056*h*0.79) = 5398
# h = (liquidity + fcf_base - obligations_12m) / (ebitda_base*(1-tax)) = 122734 / 88524.24 = 1.3864
#   -> h > 1: liquidity is not exhausted by any EBITDA decline, even a full wipeout

# Check at h = 1.0 (100% EBITDA loss, the theoretical limit):
# fcf(1.0) = 37872 - 112056*1.0*0.79 = -50652.24
# liquidity + fcf(1.0) = 90260 - 50652.24 = 39607.76
# surplus over 12m obligations ($5,398m) = 39607.76 - 5398 = 34209.76  (still a $34.2bn surplus)
```

**All scenarios assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2, if produced) is the expected-outcome read.** No price rises, no cost programme, no capex pullback, and no dividend cut are modelled — only the mechanical drop-through of a lower EBITDA at a fixed 21% assumed tax rate, with the debt stack, interest bill, and dividend held constant.

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **Not reached on an EBITDA decline alone** — no real covenant exists. On the illustrative-only 4.25x max-net-leverage threshold: h = 85.7%. On the illustrative-only 2.5x min-coverage threshold: h = 95.5%. Both are labelled assumptions, not real thresholds META is bound by, and both sit far beyond the −30/−40/−60% range tested |
| Committed liquidity exhausted within 12 months | **h ≥ 1 — does not breach on an EBITDA decline alone.** Solved h = 1.386 (>100%, i.e. mathematically impossible). Confirmed directly: even a full 100% EBITDA wipeout (h = 1.0) leaves liquidity + stressed FCF at $39,608m against $5,398m of 12-month obligations — a $34,210m surplus |
| Net leverage exceeds 6x (illustrative refi-market threshold) | h = 89.9% (net debt held constant at $68,202m) — far beyond the tested haircut range |

**Formulas used (direction-aware, per MODULE_RULES §11 / step 5):**
- Covenant / leverage-threshold breach (MAX/ceiling form, debt metric = net debt per META's illustrative net-leverage covenant): `h = 1 − net debt ÷ (T · EBITDA)`
- Coverage-covenant breach (MIN/floor form): `h = 1 − (T · interest) ÷ EBITDA`
- Liquidity exhaustion: solved from `liquidity + [FCF_base − EBITDA·h·(1−tax)] = next-12-month obligations`, giving `h = (liquidity + FCF_base − obligations) ÷ [EBITDA·(1−tax)]`

Because every solved `h` exceeds 1 or sits in the mid-to-high-80s/90s percent range against a genuinely non-existent real covenant, **none of the three break points is reached anywhere inside the plausible stress range this test is built to cover (−30% to −60%, or even the extreme −100% liquidity check).** The stress test therefore does not identify a first-to-break factor inside its tested range — this is itself the finding, not an omission (see §4).

## 4. Survival Read

META survives a 30–60% EBITDA decline without a covenant breach, a liquidity gap, or any need for an equity raise, distressed asset sale, or covenant waiver — the structure does not break inside the tested range at all: net leverage rises only to 1.52x (strict basis) even at −60% EBITDA, EBITDA/interest coverage still stands at 22.1x, and the 12-month liquidity surplus stays above $69,600m in every scenario, including the combined −40% EBITDA + working-capital-shock case. The company has no maintenance financial covenant to breach in the first place — its Notes carry none — so the only way to test "covenant breach" here is against illustrative, explicitly labelled market-typical thresholds (4.25x max leverage / 2.5x min coverage), and even those would require an 86–96% EBITDA collapse, a scenario this stress test does not consider plausible and is not attempting to price. Liquidity does not run out even under the most extreme check performed: a full, mechanical 100% EBITDA wipeout for 12 months still leaves a $34.2bn liquidity surplus over the year's obligations ($0 debt maturities + $5,398m dividends), because $90,260m is already sitting in cash and marketable securities today. **Market closure test:** assuming no new unsecured refinancing is available for 12 months, nothing changes — $0 is contractually due in the next 12 months, the entire $4,250m due through 2028 is dwarfed by cash on hand ($15,462m) alone, and no covenant-triggered acceleration exists to force action even if credit markets shut [`02_maturity-wall-and-refinancing.md` §4]. On the module's canonical strict net-debt basis (§15), META is not currently net cash — it carries $68,202m of net debt (0.61x EBITDA) after a real, capex-funded leverage build from a net-cash position every year FY2021–FY2024 [`01_capital-structure-and-leverage.md` §6]; on the broad basis (also netting marketable securities), it remains net cash by $6,596m. Either way, the survival math above holds without qualification: this stress test finds no break point inside a normal-recession-scale decline, and the first constraint that would actually bind — if one exists — sits well outside the range a 30–60% EBITDA stress, or even a full EBITDA wipeout, is capable of reaching from today's starting leverage and liquidity.
