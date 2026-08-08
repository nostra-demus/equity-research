# Downside Stress Test — UBER

Reporting currency: US dollars (USD, millions unless stated). All figures are as of the June 30, 2026 balance sheet (the latest in the data pool) unless stated otherwise, and follow the canonical basis `01_capital-structure-and-leverage.md` designates for this module: gross debt = interest-bearing debt + finance leases ($12,945M); net debt = the **strict** basis (gross debt − cash & equivalents only) = **$8,075M** [`01` §7]. All stressed figures below were computed with an executed Python script (not by hand); the formulas are shown inline so the reader can reproduce every number.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $7,474M (LTM reported EBITDA, twelve months ended Jun-30-2026, GAAP Income from operations + D&A) | `01` §5/§7; `earnings/01_historical-financials.md` |
| Net debt (canonical, strict, §15) | $8,075M | `01` §4/§7 |
| Net debt / EBITDA | 1.08x | `01` §5 |
| EBITDA / interest | 17.9x ($7,474M ÷ $418M TTM interest expense) | `04` §1 |
| Tightest covenant + threshold | **No numeric maintenance covenant is disclosed.** `04` applies a labeled-assumption max net leverage covenant of 4.0x (indicative only, "Not assessable" for scoring) — this is the tightest of the two labeled assumptions (max leverage 4.0x vs. min interest coverage 3.0x) and is used below for illustrative breach solves | `04` §2/§3 |
| Next-12m obligations (gross-obligations basis) | $2,778M = $2,000M Term Loan maturity (Dec-2026) + ~$470M cash interest (annualized H1 proxy) + $308M capex + $0 committed dividends/buybacks | `02` §1; `03` §2 |
| Committed liquidity | $10,391M = $4,870M cash + $521M short-term investments + $5,000M fully-available, undrawn Revolver | `03` §1 |
| Floating-rate debt (gross) | $2,000M (15.4% of gross debt) — the 2026 Term Loan only; the $5.0bn Revolver is also floating but undrawn | `02` §3 |
| Hedge coverage (interest rate) | **None disclosed.** No interest-rate swap or cap found against the Term Loan or Revolver | `02` §3 |
| Working-capital seasonality / peak build | Moderate, not extreme: ~4.2-point spread between the smallest quarter (Q1, ~23.0% of annual revenue) and the largest (Q4, ~27.2%); no peak-quarter cash-usage figure is disclosed | `03` §3 |

Reporting currency: USD. EBITDA basis: LTM (twelve months ended Jun-30-2026) **reported/GAAP-basis** EBITDA (Income from operations + D&A), not Uber's discontinued non-GAAP "Adjusted EBITDA" (last disclosed FY2025 at $8,730M, stale and no longer reported from Q1 FY2026 onward) [`01` §5, §7]. This EBITDA is cash-backed, not merely accounting profit: `earnings/06_earnings-quality.md` §1–§2 shows CFO has exceeded reported EBITDA by 150–202% in every profitable year (185.5% FY2023, 201.8% FY2024, 160.0% FY2025), so using reported EBITDA as the stress base is, if anything, conservative relative to the cash the business actually throws off — it is not inflated by the addbacks (stock-based compensation, legal-reserve releases) that make Uber's own discontinued Adjusted EBITDA run 38.9% above the GAAP figure [`earnings/06` §7].

**Subsequent-event flag carried forward.** None of the figures above reflect the pending Delivery Hero acquisition (signed 2026-07-16, ~$14.8bn equity value, funded via a new €14.2bn bridge credit agreement; expected close H2 2027) — it is a subsequent event not on the Jun-30-2026 balance sheet [`01` §5]. §2a below builds the pro-forma overlay this creates.

## 2. Stress Scenarios (as-reported base)

All computed via an executed Python script. Formulas: Net leverage = net debt (held constant at $8,075M) ÷ stressed EBITDA. Coverage = stressed EBITDA ÷ interest (held constant at $418M, except the rate-shock column). Covenant headroom (MAX form, per `04`/MODULE_RULES) = (4.0x − actual leverage) ÷ 4.0x. Stressed FCF(h) = FCF_base ($10,116M TTM) − EBITDA₀ × h × (1 − tax); tax = 21% (labeled assumption, US statutory rate — conservative, since Uber's actual recent cash tax rate has run far lower, ~5–6% of EBITDA per `earnings/06` §1 cash-tax-paid figures, so this assumption understates surviving FCF rather than flatters it). Liquidity gap = next-12m obligations − (committed liquidity + stressed FCF); a negative number is a surplus.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | $7,474M | $5,232M | $4,484M | $2,990M | $4,484M | $4,484M |
| Net debt / EBITDA | 1.08x | 1.54x | 1.80x | 2.70x | 1.80x | 1.80x (unaffected — leverage covenant uses net debt/EBITDA, not interest) |
| EBITDA / interest | 17.9x | 12.5x | 10.7x | 7.2x | 10.7x | 9.8x ($4,484M ÷ $458M — interest up $40M from +200bp on the $2,000M unhedged floating Term Loan) |
| Tightest covenant headroom (labeled 4.0x max leverage, MAX form) | +73.0% | +61.4% | +55.0% | +32.5% | +55.0% | +55.0% |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap | −$17,729M (surplus) | −$15,958M (surplus) | −$15,367M (surplus) | −$14,186M (surplus) | −$14,815M (surplus; obligations +$552M for a labeled 1%-of-TTM-revenue WC build) | −$15,327M (surplus; obligations +$40M for the rate shock) |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**Deep-cyclical calibration — not applied, and why.** `business-model/10_external-dependency.md` rates Uber's consumer-cycle exposure "Mid-High" for the Delivery segment specifically (about one-third of FY2025 revenue) but does **not** classify Uber as a deep cyclical/commodity name with a proven multi-year trough-to-peak EBITDA range: Uber's EBITDA was negative through FY2022 for scale-driven reasons (a young, subscale platform), not a macro trough, so there is no clean historical trough to calibrate a haircut against [`01` §5 cyclicality note; `10_external-dependency` §1, §4]. No history-calibrated scenario is added on that basis — this is a stated absence of usable history, not a finding that Uber is immune to a downturn.

## 2a. Pending-Acquisition (Pro-Forma) Overlay — Delivery Hero

Uber signed a business combination agreement on 2026-07-16 to acquire Delivery Hero SE for ~$14.8bn of equity value (100% cash consideration, €41.50/share), executed a €14.2bn bridge credit agreement the same day to help fund it, and expects to close in H2 2027 [`01` §5]. This is material, debt-funded, and not yet on the balance sheet — per the workflow's pending-acquisition rule, a pro-forma base is built here, on the same strict net-debt basis as the rest of this report.

**Currency conversion.** No dated EUR/USD rate exists in the data pool. A web-sourced rate is used, labeled per §4/§27: **EUR/USD = 1.1552** [Web: open.er-api.com exchange-rate feed, 2026-08-08, indicative/unverified]. €14.2bn × 1.1552 ≈ **$16,404M**.

| Step | Value | Reasoning |
|---|---:|---|
| Current net debt (strict) | $8,075M | `01` §7 |
| + Debt-funded consideration (full bridge facility, USD-converted) | $16,404M | The bridge is disclosed only as "help[ing] fund" the acquisition, with no pool-disclosed breakdown between equity consideration, fees, and any refinancing of Delivery Hero's own debt. The full bridge is added rather than separately adding Delivery Hero's own consolidating net debt on top — adding both would double-count if the bridge already covers target-debt refinancing |
| + Delivery Hero's own consolidating net debt | Not added separately (see above) | Avoids double-counting the funding leg already captured in the bridge |
| **Pro-forma net debt** | **≈$24,479M** | Computed |
| **Pro-forma gross debt** | **≈$29,349M** (≈2.27x current $12,945M — "roughly double," consistent with `01` §5 and `business-model/11` §1's independent "roughly double" characterization) | Computed |

**EBITDA perimeter.** Delivery Hero's own EBITDA is **not disclosed anywhere in this data pool** — it is a German-listed company outside Uber's filings and outside the pool's scope. Per the workflow rule, this is stated plainly rather than fabricated. Pro-forma EBITDA below uses **Uber's own EBITDA only ($7,474M)** — this is a deliberate, conservative floor: the debt perimeter includes financing for the entire target (potentially including its own debt), while the EBITDA perimeter excludes the target's earnings entirely. This overstates pro-forma leverage rather than understates it (Core Principle: assume the more fragile reading when data is thin) — if Delivery Hero's own EBITDA becomes available, true pro-forma leverage would read lower than shown here, not higher.

| Metric | Pro-forma, Uber-only EBITDA (floor/conservative) | Pro-forma, on stale FY2025 Adjusted EBITDA ($8,730M) |
|---|---:|---:|
| Net debt / EBITDA, base (0% haircut) | **3.28x** | 2.80x |
| Net debt / EBITDA, −30% EBITDA | 4.68x | — |
| Net debt / EBITDA, −40% EBITDA | 5.46x | — |
| Net debt / EBITDA, −60% EBITDA | 8.19x | — |

Uber is not classified as a deep cyclical (§2 above), so no separate mid-cycle EBITDA series exists for it; the "stale FY2025 Adjusted EBITDA" column is shown alongside as the only other EBITDA basis this module has anchored, not as a true normalised/mid-cycle read — flagged as such.

**What this means.** Pro-forma leverage of ~3.3x today (Uber-only-EBITDA basis) is already triple the current 1.08x, and a plain −40% EBITDA decline would push it to ~5.5x — above the 4.0x labeled covenant assumption tested in §2, though that assumption applies to *today's* debt instruments, not to whatever covenant package the new bridge/permanent Delivery Hero financing carries (undisclosed) [`04` §3 pro-forma flag]. **Coverage cannot be computed for the pro-forma structure** — the interest rate and terms of the eventual permanent financing that will replace the bridge are not yet disclosed [`02` §5]. This overlay is a magnitude check, not a probability-weighted forecast: the deal has not closed, remains subject to conditions, and is not expected to close until H2 2027.

## 3. Break Points

All haircuts and solves below use the **as-reported** base ($8,075M net debt, $7,474M EBITDA, $418M interest), computed via an executed Python script.

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest labeled covenant breaches (max net leverage, 4.0x, MAX form) | **73.0%** |
| Min interest coverage covenant breaches (3.0x, MIN form, for reference — not the tightest) | 83.2% |
| Net leverage exceeds an illustrative 6.0x refi-market threshold (MAX form) | 82.0% |
| Committed liquidity exhausted within 12 months | **Does not breach on an EBITDA decline alone** — solve returns h ≈ 300% |

**Covenant breach solve (MAX/ceiling form)** — holding net debt constant at $8,075M: `h = 1 − net debt ÷ (T × EBITDA) = 1 − 8,075 ÷ (4.0 × 7,474) = 1 − 8,075 ÷ 29,896 = 0.730` → **73.0% decline**. This matches `04` §3's own independent computation exactly. At that point stressed EBITDA is ≈$2,019M.

**Min-coverage breach solve (MIN/floor form)** — holding interest constant at $418M: `h = 1 − (T × interest) ÷ EBITDA = 1 − (3.0 × 418) ÷ 7,474 = 1 − 1,254 ÷ 7,474 = 0.832` → **83.2% decline**. Interest coverage is the looser of the two labeled covenants — leverage breaks first.

**Refi-threshold solve** — same MAX form with T = 6.0x: `h = 1 − 8,075 ÷ (6.0 × 7,474) = 1 − 8,075 ÷ 44,844 = 0.820` → **82.0% decline**.

**Liquidity exhaustion solve.** Usable liquidity is $10,391M (no minimum-liquidity covenant is disclosed to net against it, and no restricted/trapped cash is included in this figure — `03` §1 already excludes $11,793M of restricted cash/investments). Solving `liquidity + FCF(h) = next-12m obligations` for h: `h = (liquidity + FCF_base − obligations) ÷ (EBITDA₀ × (1 − tax)) = (10,391 + 10,116 − 2,778) ÷ (7,474 × 0.79) = 17,729 ÷ 5,904.5 = 3.00`. **This is h ≥ 1** — the rule for that case applies directly: liquidity does **not** run out on an EBITDA decline alone. The mechanical check confirms it: even at a complete, 100% EBITDA wipeout (h=1.0), stressed FCF under this scaling is still $10,116M − $5,904.5M = **$4,212M**, comfortably above the $2,778M of 12-month obligations, before touching a dollar of the $10,391M in-hand liquidity. This result reflects Uber's FCF running well above its own EBITDA (TTM FCF $10,116M vs. TTM EBITDA $7,474M, per `earnings/06` §1) combined with a small, already-covered 12-month obligations bucket — not a claim that cash flow is literally EBITDA-decline-proof in a real, non-linear stress (working-capital reversals, an accelerated insurance-claims payout, or a stop to buyback discretion could all move the picture in ways a linear EBITDA-to-FCF scaling does not capture — see the caveats below).

## 4. Survival Read

Uber does not break under a 30%, 40%, or even 60% EBITDA decline on the as-reported balance sheet: net leverage only reaches 2.70x at the −60% haircut (versus the labeled 4.0x covenant assumption), interest coverage stays above 7x, and the 12-month liquidity picture stays a multi-billion-dollar surplus in every column of §2 — no covenant breach, no liquidity gap, no need for a waiver, an asset sale, or an equity raise at any of the tested haircuts. The **first thing that would actually break** is the labeled max-leverage covenant assumption, and it takes a **73% EBITDA decline** to reach it — a level far beyond a normal recession and closer to an existential event for the business; the true threshold could sit closer or farther away since no instrument in the pool discloses a real numeric covenant (`04` §2). Under a market-closure test (no new unsecured issuance for 12 months): the only obligation due in that window, the $2,000M Term Loan maturing December 2026, is covered 2.7x over by cash and short-term investments alone ($5,391M) without touching the undrawn $5.0bn Revolver or TTM FCF — nothing breaks. Uber is **not** net cash (it carries $8,075M of net debt, strict basis), but its net leverage of 1.08x is low enough, and its liquidity cushion deep enough, that a normal-recession-scale EBITDA decline (30–40%) is survivable with room to spare on this report's figures alone.

The one genuine unknown this report cannot resolve from the data pool is what happens if the Delivery Hero bridge converts to permanent financing at scale before any downturn hits: §2a shows pro-forma leverage already at ~3.3x on day one (versus 1.08x today) and rising toward ~5.5x under a −40% EBITDA haircut — a materially thinner cushion than the as-reported picture, on a covenant package this pool does not yet disclose. Two smaller latent items sit outside the mechanical EBITDA-decline math entirely: a $1.8bn UK VAT (HMRC) receivable already paid in cash that could be impaired if Uber's appeal fails, and a further, not-yet-quantified live cash exposure the company itself flags for later VAT assessments [`05` §3] — neither is EBITDA-driven, so neither is captured by the haircuts above, but both would land on the same balance sheet this stress test is testing.
